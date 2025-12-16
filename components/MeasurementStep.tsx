import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { MeasurementWithValue } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, SpeakerWaveIcon } from './IconComponents';

interface MeasurementStepProps {
  dancerName: string;
  measurement: MeasurementWithValue;
  measurementIndex: number;
  prevMeasurement?: MeasurementWithValue;
  onValueChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  audioCache: Record<string, string>;
  onAddToCache: (id: string, base64: string) => void;
  audioContext: AudioContext | null;
}

// --- Audio Utility Functions ---

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.split(',')[1] || base64); // Handle Data URL prefix
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Create a WAV container for PCM data so browsers can decode it easily
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
    view.setUint32(16, 16, true); // sub-chunk 1 size (16 for PCM)
    view.setUint16(20, 1, true); // audio format (1 for PCM)
    view.setUint16(22, numChannels, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // byte rate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // block align
    view.setUint16(34, bitsPerSample, true); // bits per sample

    // "data" sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); // sub-chunk 2 size

    // Copy PCM data
    new Uint8Array(buffer, 44).set(new Uint8Array(pcmData));
    
    return new Blob([buffer], { type: 'audio/wav' });
}

const MeasurementStep: React.FC<MeasurementStepProps> = ({
  dancerName,
  measurement,
  measurementIndex,
  prevMeasurement,
  onValueChange,
  onNext,
  onPrev,
  isFirst,
  isLast,
  audioCache,
  onAddToCache,
  audioContext,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Audio States
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [errorState, setErrorState] = useState<'none' | 'quota' | 'generic'>('none');
    
    // Track multiple sources for stitched playback (Intro + Static Instruction)
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

    // Stop audio when component unmounts or measurement changes
    useEffect(() => {
        stopAudio();
        setErrorState('none');
        inputRef.current?.focus();
        
        return () => stopAudio();
    }, [measurement.id]);

    const stopAudio = () => {
        activeSourcesRef.current.forEach(source => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
        });
        activeSourcesRef.current = [];
        setIsPlaying(false);
        setIsAudioLoading(false);
    };

    const playAudioSequence = async (buffers: AudioBuffer[]) => {
        if (!audioContext || buffers.length === 0) return;

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const sources: AudioBufferSourceNode[] = [];
        let startTime = audioContext.currentTime;

        buffers.forEach((buffer, index) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            
            // Schedule the audio parts to play back-to-back
            source.start(startTime);
            startTime += buffer.duration;
            
            sources.push(source);
        });

        activeSourcesRef.current = sources;

        // When the last segment finishes, update state
        const lastSource = sources[sources.length - 1];
        lastSource.onended = () => {
            setIsPlaying(false);
            activeSourcesRef.current = [];
        };

        setIsPlaying(true);
    };

    // Helper: Call Gemini to generate a snippet of audio
    const generateGeminiAudio = async (text: string, cacheKey: string): Promise<AudioBuffer> => {
        if (!process.env.API_KEY || !audioContext) {
            throw new Error("Missing API Key or AudioContext");
        }

        // 1. Check Cache
        if (audioCache[cacheKey]) {
            const response = await fetch(audioCache[cacheKey]);
            const arrayBuffer = await response.arrayBuffer();
            return await audioContext.decodeAudioData(arrayBuffer);
        }

        // 2. Call API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: ['AUDIO'] as any, 
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Empty audio response from Gemini");

        // 3. Process & Cache
        const pcmArrayBuffer = base64ToArrayBuffer(base64Audio);
        const wavBlob = createWavBlob(pcmArrayBuffer, 24000);
        const dataUrl = await blobToBase64(wavBlob);
        
        onAddToCache(cacheKey, dataUrl); // Save for next time

        const wavArrayBuffer = await wavBlob.arrayBuffer();
        return await audioContext.decodeAudioData(wavArrayBuffer);
    };

    // Helper: Fetch a static audio file
    const fetchStaticAudio = async (id: string): Promise<AudioBuffer> => {
         if (!audioContext) throw new Error("No AudioContext");

         // 1. Check Virtual Cache (Loaded via "Load Files" button)
         if (audioCache[id]) {
            // It's a Data URL string, fetch reads it automatically
            const response = await fetch(audioCache[id]);
            const arrayBuffer = await response.arrayBuffer();
            return await audioContext.decodeAudioData(arrayBuffer);
         }

         // 2. Check Real Filesystem (For real server deployment)
         // Using relative path 'audio/' to support subfolder deployments. 
         // Ensure your audio files are in 'public/audio/' folder in your project.
         const url = `audio/${id}.wav`;
         const response = await fetch(url);
         
         if (!response.ok) {
            // We do NOT throw here immediately to allow fallback logic in caller
            throw new Error(`Static file fetch failed: ${response.status} ${response.statusText}`);
         }
         
         const arrayBuffer = await response.arrayBuffer();
         return await audioContext.decodeAudioData(arrayBuffer);
    };

    const handleVoiceRequest = async () => {
        if (isPlaying) {
            stopAudio();
            return;
        }

        setIsAudioLoading(true);
        setErrorState('none');

        try {
            if (!audioContext) throw new Error("Audio Context not ready");
            
            // Resume context if needed (browsers block autoplay)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const staticId = measurement.id;
            
            // Construct Texts
            const introText = measurementIndex === 0
                ? `Hi ${dancerName}, let's start with ${measurement.name}.`
                : `Next is ${measurement.name}.`;
            
            const fullTextFallback = `${introText} ${measurement.audioTip}`;
            
            const introCacheKey = `intro_${dancerName}_${measurement.id}`;
            const fullCacheKey = `full_${dancerName}_${measurement.id}`;

            // Check if we have an API key available. If not, we skip the dynamic intro.
            const hasApiKey = process.env.API_KEY && process.env.API_KEY.length > 0;

            // --- STRATEGY: Robust Hybrid Audio ---
            // 1. Always attempt to fetch the Static Instruction File.
            // 2. If API Key exists, attempt to fetch/generate Personalized Intro concurrently.
            // 3. Stitch together what we have.

            // Wrapped Static Fetch
            const fetchStaticPromise = async () => {
                try {
                    const buffer = await fetchStaticAudio(staticId);
                    return buffer;
                } catch (e) {
                    console.warn(`Static file fetch failed for ${staticId}. Ensure file exists in public/audio/`, e);
                    return null;
                }
            };

            // Wrapped Intro Gen
            const fetchIntroPromise = async () => {
                if (!hasApiKey) return null; // Skip if no key, don't error
                try {
                    return await generateGeminiAudio(introText, introCacheKey);
                } catch (e) {
                    console.warn("Intro generation failed (skipping intro):", e);
                    return null;
                }
            };

            // Execute in parallel
            const [staticBuffer, introBuffer] = await Promise.all([
                fetchStaticPromise(),
                fetchIntroPromise()
            ]);

            // DECISION LOGIC
            
            // Scenario 1: We have the static file (Success)
            if (staticBuffer) {
                const playlist: AudioBuffer[] = [];
                // If we also managed to get the personalized intro, add it first
                if (introBuffer) {
                    playlist.push(introBuffer);
                }
                // Always add the main instruction
                playlist.push(staticBuffer);
                
                await playAudioSequence(playlist);
                return;
            }

            // Scenario 2: No static file. Must fallback to full generation.
            if (!staticBuffer) {
                if (hasApiKey) {
                     console.log("Static file missing. Attempting full API generation fallback.");
                     // Try generating the full explanation via API
                     const fullBuffer = await generateGeminiAudio(fullTextFallback, fullCacheKey);
                     await playAudioSequence([fullBuffer]);
                     return;
                } else {
                    // Scenario 3: No file AND no API key.
                    throw new Error("Audio unavailable: Static file missing and no API Key configured.");
                }
            }

        } catch (error: any) {
            console.error("Audio Error:", error);
            if (
                error.toString().includes('429') || 
                error.toString().includes('RESOURCE_EXHAUSTED') ||
                error.toString().includes('quota')
            ) {
                setErrorState('quota');
            } else {
                setErrorState('generic');
            }
        } finally {
            setIsAudioLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (measurement.value) {
            onNext();
        }
      }
    };

    const showCategoryHeader = !prevMeasurement || prevMeasurement.category !== measurement.category;
    const ImageComponent = measurement.imageComponent;

    // Determine Button Style based on State
    const getButtonContent = () => {
        if (errorState === 'quota') {
            return (
                <span className="text-xs text-amber-600 font-medium px-2">Limit Reached</span>
            );
        }
        if (errorState === 'generic') {
            return (
                <span className="text-xs text-red-500 font-medium px-2">Unavailable</span>
            );
        }
        if (isAudioLoading) {
            return <div className="w-5 h-5 border-2 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>;
        }
        if (isPlaying) {
             return (
                <div className="flex gap-0.5 items-end h-4">
                    <div className="w-1 bg-indigo-600 h-2 animate-pulse"></div>
                    <div className="w-1 bg-indigo-600 h-4 animate-pulse delay-75"></div>
                    <div className="w-1 bg-indigo-600 h-3 animate-pulse delay-150"></div>
                </div>
             );
        }
        return <SpeakerWaveIcon className="w-6 h-6" />;
    };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
      {showCategoryHeader && (
        <div className="mb-6 pb-3 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-indigo-700 tracking-wide">{measurement.category}</h3>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
          <ImageComponent 
            aria-label={`Diagram for ${measurement.name}`}
            className="w-full h-auto max-h-[400px] md:max-h-full"
           />
        </div>
        <div className="flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{measurement.name}</h2>
                
                <button 
                    onClick={handleVoiceRequest} 
                    disabled={isAudioLoading || errorState !== 'none'}
                    className={`
                        flex-shrink-0 h-10 min-w-[40px] flex items-center justify-center rounded-full transition-all duration-200
                        ${errorState === 'none' ? 'hover:bg-indigo-50 text-gray-600 hover:text-indigo-600' : ''}
                        ${errorState === 'quota' ? 'bg-amber-50 cursor-not-allowed border border-amber-100' : ''}
                        ${errorState === 'generic' ? 'bg-red-50 cursor-not-allowed border border-red-100' : ''}
                        ${isPlaying ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100' : ''}
                    `}
                    aria-label={isPlaying ? "Stop audio" : "Play audio explanation"}
                    title={
                        errorState === 'quota' ? "Daily voice generation limit reached." :
                        errorState === 'generic' ? "Audio currently unavailable. Check console for details." :
                        "Play explanation"
                    }
                >
                    {getButtonContent()}
                </button>
            </div>

          <p className="text-gray-600 mt-2 mb-4 text-base">{measurement.description}</p>
          <div className="relative mt-2">
            <input
              ref={inputRef}
              type="number"
              id={measurement.id}
              value={measurement.value}
              onChange={(e) => onValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter measurement"
              className="w-full pl-4 pr-16 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
              min="0"
              step="0.1"
            />
             <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 text-lg">
              in
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!measurement.value}
          className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLast ? 'Review Measurements' : 'Next'}
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MeasurementStep;