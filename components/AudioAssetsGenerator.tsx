import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MEASUREMENT_STEPS } from '../constants';

// --- Utility Functions Duplicated for Independence ---

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
    const dataView = new DataView(pcmData);
    const dataSize = pcmData.byteLength;
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // chunk size
    writeString(8, 'WAVE');

    // "fmt " sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); 
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); 
    view.setUint16(34, bitsPerSample, true); 

    // "data" sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); 

    new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
    
    return new Blob([buffer], { type: 'audio/wav' });
}

export const AudioAssetsGenerator: React.FC = () => {
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
                
                // Create download link and click it programmatically
                const a = document.createElement('a');
                a.href = url;
                a.download = `${step.id}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            // Short delay to respect rate limits
            await new Promise(r => setTimeout(r, 800));
            
        } catch(e) {
            console.error(`Error generating ${step.id}:`, e);
        }
    }
    
    setGenerating(false);
    setProgress(p => ({ ...p, log: "Complete! Please move downloaded files to public/audio/" }));
  };

  return (
    <div className="mt-12 p-6 bg-gray-50 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Dev Tools: Audio Asset Generator</h3>
        <p className="text-sm text-gray-600 mb-4">
            Generates static audio instructions for all steps using Gemini and downloads them as .wav files.
            Move these files to a folder named <code>public/audio/</code> in your project.
        </p>
        
        <button 
            onClick={generateAll}
            disabled={generating}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
        >
            {generating ? `Generating (${progress.current}/${progress.total})...` : 'Generate & Download All Audio Assets'}
        </button>
        
        {progress.log && (
            <div className="mt-2 text-sm text-indigo-600 font-mono">
                {progress.log}
            </div>
        )}
    </div>
  );
};
