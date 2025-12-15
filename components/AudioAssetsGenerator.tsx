import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MEASUREMENT_STEPS } from '../constants';

interface AudioAssetsGeneratorProps {
    onLoadFiles?: (files: { name: string, data: string }[]) => void;
}

// --- Utility Functions ---

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function createWavBlob(pcmData: ArrayBuffer, sampleRate: number = 24000): Blob {
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.byteLength;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); 
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); 
    view.setUint16(34, bitsPerSample, true); 
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); 
    new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
    
    return new Blob([buffer], { type: 'audio/wav' });
}

export const AudioAssetsGenerator: React.FC<AudioAssetsGeneratorProps> = ({ onLoadFiles }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number, log: string}>({ current: 0, total: MEASUREMENT_STEPS.length, log: '' });

  const generateAll = async () => {
    if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }

    setGenerating(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    for (let i = 0; i < MEASUREMENT_STEPS.length; i++) {
        const step = MEASUREMENT_STEPS[i];
        try {
            setProgress({ current: i + 1, total: MEASUREMENT_STEPS.length, log: `Generating ${step.name}...` });
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: step.audioTip }] }],
                config: { 
                    responseModalities: ['AUDIO'] as any,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                }
            });
            
            const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64) {
                const wavBlob = createWavBlob(base64ToArrayBuffer(base64), 24000);
                const url = URL.createObjectURL(wavBlob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${step.id}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            await new Promise(r => setTimeout(r, 800));
            
        } catch(e) {
            console.error(`Error generating ${step.id}:`, e);
        }
    }
    
    setGenerating(false);
    setProgress(p => ({ ...p, log: "Download Complete." }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !onLoadFiles) return;
      
      const files = Array.from(e.target.files) as File[];
      let loadedCount = 0;
      const loadedFiles: { name: string, data: string }[] = [];

      files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (evt) => {
              if (evt.target?.result) {
                  loadedFiles.push({
                      name: file.name,
                      data: evt.target.result as string
                  });
                  loadedCount++;
                  if (loadedCount === files.length) {
                      onLoadFiles(loadedFiles);
                      setProgress({ current: files.length, total: files.length, log: `Loaded ${files.length} files into app memory!` });
                  }
              }
          };
          reader.readAsDataURL(file);
      });
  };

  return (
    <div className="mt-12 p-6 bg-gray-50 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Audio Asset Manager</h3>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start text-left max-w-4xl mx-auto">
            
            {/* Generator Column */}
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2">1. Generate & Download</h4>
                <p className="text-xs text-gray-500 mb-4">
                    This will use your API key to generate audio files for all steps and download them to your computer.
                </p>
                <button 
                    onClick={generateAll}
                    disabled={generating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium w-full mb-3"
                >
                    {generating ? `Generating (${progress.current}/${progress.total})...` : 'Generate Files'}
                </button>
                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                    <strong>DEPLOYMENT INSTRUCTION:</strong><br/>
                    After downloading, move these files to your project folder at: <br/>
                    <code className="bg-yellow-100 px-1 rounded">public/audio/</code> <br/>
                    Then redeploy your app.
                </div>
            </div>

            {/* Uploader Column */}
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                 <h4 className="font-semibold text-gray-700 mb-2">2. Load Files (Test Mode)</h4>
                 <p className="text-xs text-gray-500 mb-4">
                    Upload the downloaded files here to test them immediately in this browser session without redeploying.
                 </p>
                 <label className="block">
                    <span className="sr-only">Choose files</span>
                    <input 
                        type="file" 
                        accept=".wav"
                        multiple
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100 cursor-pointer"
                    />
                </label>
            </div>
        </div>
        
        {progress.log && (
            <div className="mt-4 text-sm text-indigo-600 font-mono text-center">
                {progress.log}
            </div>
        )}
    </div>
  );
};