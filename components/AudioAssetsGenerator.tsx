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
  const [selectedId, setSelectedId] = useState(MEASUREMENT_STEPS[0].id);

  const generateFile = async (step: typeof MEASUREMENT_STEPS[0]) => {
     if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
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
    } catch(e) {
        console.error(`Error generating ${step.id}:`, e);
        throw e;
    }
  };

  const generateSingle = async () => {
    setGenerating(true);
    setProgress({ current: 0, total: 1, log: `Generating ${selectedId}...` });
    const step = MEASUREMENT_STEPS.find(s => s.id === selectedId);
    if (step) {
        await generateFile(step);
    }
    setGenerating(false);
    setProgress(p => ({ ...p, log: `Generated ${selectedId}.wav` }));
  };

  const generateAll = async () => {
    setGenerating(true);
    
    for (let i = 0; i < MEASUREMENT_STEPS.length; i++) {
        const step = MEASUREMENT_STEPS[i];
        try {
            setProgress({ current: i + 1, total: MEASUREMENT_STEPS.length, log: `Generating ${step.name}...` });
            await generateFile(step);
            await new Promise(r => setTimeout(r, 800)); // Rate limit buffer
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
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full">
                <h4 className="font-semibold text-gray-700 mb-2">1. Generate & Download</h4>
                <p className="text-xs text-gray-500 mb-4">
                    Generate audio files and upload them to <code>public/audio/</code> in your GitHub repo.
                </p>
                
                <div className="flex gap-2 mb-4">
                     <select 
                        value={selectedId} 
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="flex-1 text-sm border-gray-300 rounded p-2"
                     >
                        {MEASUREMENT_STEPS.map(s => (
                            <option key={s.id} value={s.id}>{s.id}</option>
                        ))}
                     </select>
                     <button 
                        onClick={generateSingle}
                        disabled={generating}
                        className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-xs font-bold"
                    >
                        Generate One
                    </button>
                </div>

                <button 
                    onClick={generateAll}
                    disabled={generating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium w-full mb-3"
                >
                    {generating && progress.total > 1 ? `Generating All (${progress.current}/${progress.total})...` : 'Generate All Files'}
                </button>
                
                <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                    <strong>⚠️ DEPLOYMENT STEP:</strong><br/>
                    Move downloaded files to: <code className="bg-yellow-100 px-1 rounded font-bold">public/audio/</code> in your GitHub repo.
                </div>
            </div>

            {/* Uploader Column */}
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full">
                 <h4 className="font-semibold text-gray-700 mb-2">2. Load Files (Test Mode)</h4>
                 <p className="text-xs text-gray-500 mb-4">
                    Upload .wav files here to test immediately without redeploying.
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