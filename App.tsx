import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MEASUREMENT_STEPS } from './constants';
import type { MeasurementWithValue, CustomerDetails, CostumeSpecs } from './types';
import ProgressBar from './components/ProgressBar';
import ModeSelectionStep from './components/ModeSelectionStep';
import WelcomeStep from './components/WelcomeStep';
import MeasurementStep from './components/MeasurementStep';
import MeasurementReviewStep from './components/MeasurementReviewStep';
import AnalysisFeedbackStep from './components/AnalysisFeedbackStep';
import DetailsStep from './components/DetailsStep';
import ReviewStep from './components/ReviewStep';
import { CheckIcon, DownloadIcon, WhatsAppIcon } from './components/IconComponents';
import { AudioAssetsGenerator } from './components/AudioAssetsGenerator';

// Declare jsPDF from CDN for TypeScript
declare const jspdf: any;

const initialCustomerDetails: CustomerDetails = {
  name: '',
  street: '',
  city: '',
  postalCode: '',
  state: '',
  country: '',
  phone: '',
  email: '',
};

const initialCostumeSpecs: CostumeSpecs = {
  colorChoices: [
    { id: 1, dress: '', saree: '', border: '' },
    { id: 2, dress: '', saree: '', border: '' },
    { id: 3, dress: '', saree: '', border: '' },
  ],
  pattern: '',
  blouseType: '',
  specialInstructions: '',
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'measurementTool' | 'orderForm' | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dancerName, setDancerName] = useState('');
  const [measurements, setMeasurements] = useState<MeasurementWithValue[]>(() =>
    MEASUREMENT_STEPS.map(step => ({ ...step, value: '' }))
  );
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(initialCustomerDetails);
  const [costumeSpecs, setCostumeSpecs] = useState<CostumeSpecs>(initialCostumeSpecs);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  
  // Audio Cache: Stores Data URLs (base64) of the audio to save API quota on refreshes
  const [audioCache, setAudioCache] = useState<Record<string, string>>(() => {
    try {
        const saved = localStorage.getItem('shanthi_audio_cache');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.warn("Could not load audio cache from local storage", e);
        return {};
    }
  });
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [showAudioTools, setShowAudioTools] = useState(false);

  // Check for admin flag in URL to show dev tools automatically, or rely on toggle
  const adminFlag = new URLSearchParams(window.location.search).get('admin') === 'true';
  useEffect(() => {
      if (adminFlag) setShowAudioTools(true);
  }, [adminFlag]);
  
  // Step Indices
  const measurementStepsCount = MEASUREMENT_STEPS.length;
  // Flow: 0(Welcome) -> 1..N(Measure) -> N+1(Measure Review) -> N+2(Analysis) -> [if orderForm: N+3(Details) -> N+4(Final Review)] -> Completion
  const measurementReviewStepIndex = measurementStepsCount + 1;
  const analysisStepIndex = measurementStepsCount + 2;
  const detailsStepIndex = measurementStepsCount + 3;
  const reviewStepIndex = measurementStepsCount + 4;

  const isWelcomeStep = currentStep === 0;
  const isMeasurementStep = currentStep > 0 && currentStep <= measurementStepsCount;
  const isMeasurementReviewStep = currentStep === measurementReviewStepIndex;
  const isAnalysisStep = currentStep === analysisStepIndex;
  const isDetailsStep = currentStep === detailsStepIndex;
  const isReviewStep = currentStep === reviewStepIndex;
  
  const handleAudioInit = () => {
    if (!audioContext) {
      // Create the AudioContext on the first user interaction to comply with autoplay policies
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(newAudioContext);
    }
  };

  const handleAddToCache = (id: string, base64DataUrl: string) => {
    setAudioCache(prev => {
        const next = { ...prev, [id]: base64DataUrl };
        try {
            // Attempt to save to local storage
            localStorage.setItem('shanthi_audio_cache', JSON.stringify(next));
        } catch (e) {
            // If quota exceeded or other error, simply fail silently for persistence
            // but the state update (memory cache) will still work for the current session.
            console.warn("Failed to save audio to localStorage (likely quota exceeded). Using in-memory cache only.");
        }
        return next;
    });
  };

  const handleNext = () => {
      setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleEdit = (target: { type: 'welcome' | 'measurement' | 'details', index?: number }) => {
    if (target.type === 'welcome') {
      setCurrentStep(0);
    } else if (target.type === 'measurement' && target.index !== undefined) {
      setCurrentStep(target.index + 1);
    } else if (target.type === 'details') {
      setCurrentStep(detailsStepIndex);
    }
  };

  // Fallback analysis when API is down/quota exceeded
  const performLocalAnalysis = (measurements: MeasurementWithValue[], name: string): string => {
    const getVal = (id: string) => parseFloat(measurements.find(m => m.id === id)?.value || '0');
    
    const waist = getVal('waist');
    const hip = getVal('aroundHip');
    const fullLen = getVal('fullLength');
    const skirtLen = getVal('skirtLength');
    const blouseLen = getVal('blouseFullLength');
    
    let feedback = `Here's a quick analysis of the measurements for ${name} (Offline Mode):\n\n`;
    let issues = [];
    
    if (hip > 0 && waist > 0 && hip <= waist) {
      issues.push("• 'Around Hip' is usually larger than 'Waist'. Please double-check these.");
    }
    
    if (fullLen > 0 && skirtLen > 0 && skirtLen > fullLen) {
      issues.push("• 'Skirt Length' seems longer than 'Full Length'. Usually Full Length (to ankle) is the maximum.");
    }

    if (blouseLen > 25) {
        issues.push("• 'Blouse Full Length' seems quite long (> 25 inches). Please verify if this is correct for a dance blouse.");
    }
    
    if (issues.length > 0) {
      feedback += "I noticed a couple of things that might need verification:\n" + issues.join("\n");
    } else {
      feedback += "The measurements look proportional and consistent. Great job!";
    }
    
    return feedback;
  };
  
  const handleAnalyzeMeasurements = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    setCurrentStep(analysisStepIndex); // Move to analysis screen to show loader

    const prompt = `
        You are an expert tailor specializing in dance costumes.
        Analyze the following body measurements for a dancer named ${dancerName} and provide brief feedback.
        - Point out any potential issues, such as unusual proportions or likely data entry errors that might need double-checking.
        - For example, if 'Around Hip' is smaller than 'Waist', flag it.
        - If all measurements seem reasonable, provide a positive confirmation.

        MEASUREMENTS (in inches):
        ${measurements.filter(m => m.value).map(m => `- ${m.name}: ${m.value}`).join('\n')}

        Provide a concise summary in a friendly and helpful tone. Keep the feedback to 2-4 sentences.
        Start with "Here's a quick analysis of the measurements for ${dancerName}:".
    `;

    const generateWithModel = async (modelName: string) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    };

    try {
        // Use gemini-3-pro-preview as the primary reasoning model
        const result = await generateWithModel('gemini-3-pro-preview');
        setAnalysisResult(result);
    } catch (error: any) {
        console.warn("Gemini 3 Pro analysis failed, trying fallback:", error);
        
        // If error is related to Quota or Billing, skip straight to local analysis
        if (error.toString().includes("429") || error.toString().includes("RESOURCE_EXHAUSTED")) {
             const localResult = performLocalAnalysis(measurements, dancerName);
             setAnalysisResult(localResult);
             return;
        }

        try {
            // Fallback to gemini-2.5-flash which is generally faster and stable
            const result = await generateWithModel('gemini-2.5-flash');
            setAnalysisResult(result);
        } catch (fallbackError) {
            console.error("Fallback to Gemini Flash also failed, using local logic:", fallbackError);
            const localResult = performLocalAnalysis(measurements, dancerName);
            setAnalysisResult(localResult);
        }
    } finally {
        setIsAnalyzing(false);
    }
  };
  
  const handleProceedFromAnalysis = () => {
    if (appMode === 'orderForm') {
      handleNext(); // Continues to DetailsStep
    } else { // measurementTool mode
      handleFinalSubmit(); // Jumps to CompletionScreen
    }
  };

  const generateOrderSummaryText = (forWhatsApp = false) => {
    const nl = forWhatsApp ? '\n' : '\r\n';
    let summary = `*Shanthi Tailors - Order Summary*${nl}`;
    summary += `*Dancer:* ${dancerName}${nl}`;

    if (appMode === 'orderForm') {
      summary += `*Customer:* ${customerDetails.name}${nl}${nl}`;

      summary += `*Contact Details:*${nl}`;
      summary += `Email: ${customerDetails.email}${nl}`;
      summary += `Phone: ${customerDetails.phone}${nl}`;
      summary += `Address: ${customerDetails.street}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.postalCode}, ${customerDetails.country}${nl}${nl}`;

      summary += `*Costume Specifications:*${nl}`;
      costumeSpecs.colorChoices.forEach((c, i) => {
        if (c.dress || c.saree || c.border) {
          summary += `Choice ${i + 1}: Dress(${c.dress}), Saree(${c.saree}), Border(${c.border})${nl}`;
        }
      });
      summary += `Blouse Type: ${costumeSpecs.blouseType}${nl}`;
      summary += `Pattern: ${costumeSpecs.pattern || 'Not specified'}${nl}`;
      summary += `Instructions: ${costumeSpecs.specialInstructions || 'None'}${nl}${nl}`;
    } else {
        summary += nl;
    }

    summary += `*Body Measurements (in inches):*${nl}`;
    measurements.forEach(m => {
        summary += `- ${m.name}: ${m.value}${nl}`;
    });

    if (analysisResult) {
        summary += `${nl}*Tailor's Feedback:*${nl}${analysisResult}${nl}`;
    }
    
    return summary;
  }
  
  const generatePdf = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Shanthi Tailors - Order Summary", 105, 20, { align: 'center' });

    let yPos = 35;

    // Customer Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(appMode === 'orderForm' ? "Customer & Dancer Details" : "Dancer Details", 14, yPos);
    yPos += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dancer: ${dancerName}`, 14, yPos);
    yPos += 6;

    if (appMode === 'orderForm') {
        doc.text(`Customer (Parent/Guardian): ${customerDetails.name}`, 14, yPos);
        yPos += 6;
        doc.text(`Phone: ${customerDetails.phone}`, 14, yPos);
        doc.text(`Email: ${customerDetails.email}`, 105, yPos);
        yPos += 6;
        doc.text(`Address: ${customerDetails.street}, ${customerDetails.city}, ${customerDetails.state} ${customerDetails.postalCode}, ${customerDetails.country}`, 14, yPos);
        yPos += 10;

        // Costume Specifications
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Costume Specifications", 14, yPos);
        yPos += 7;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        costumeSpecs.colorChoices.forEach((c, i) => {
            if (c.dress || c.saree || c.border) {
                doc.text(`Color Choice ${i + 1}: Dress(${c.dress}), Saree(${c.saree}), Border(${c.border})`, 14, yPos);
                yPos += 6;
            }
        });
        doc.text(`Blouse Type: ${costumeSpecs.blouseType}`, 14, yPos);
        yPos += 6;
        doc.text(`Pattern: ${costumeSpecs.pattern || 'Not specified'}`, 14, yPos);
        yPos += 6;
        doc.text(`Special Instructions: ${costumeSpecs.specialInstructions || 'None'}`, 14, yPos);
        yPos += 10;
    }

    // Measurements Table
    const tableBody: any[] = [];
    const grouped = measurements.reduce((acc, m) => {
        if (!acc[m.category]) acc[m.category] = [];
        acc[m.category].push([m.name, `${m.value} in`]);
        return acc;
    }, {} as Record<string, [string, string][]>);
    
    Object.keys(grouped).forEach(category => {
        tableBody.push([{ content: category, colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#EAEAEA', textColor: '#333' } }]);
        tableBody.push(...grouped[category]);
    });
    
    doc.autoTable({
        startY: yPos,
        head: [['Measurement', 'Value']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: '#4F46E5' }
    });

    if (analysisResult) {
        let finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
        finalY += 15;

        // Check for page break
        if (finalY > 270) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Tailor's Analysis Feedback", 14, finalY);
        
        finalY += 7;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        const splitText = doc.splitTextToSize(analysisResult, 180);
        doc.text(splitText, 14, finalY);
    }
    
    return doc;
  };

  const handleFinalSubmit = () => {
    setIsCompleted(true);
  };
  
  const handleRestart = () => {
    setAppMode(null);
    setCurrentStep(0);
    setDancerName('');
    setMeasurements(MEASUREMENT_STEPS.map(step => ({ ...step, value: '' })));
    setCustomerDetails(initialCustomerDetails);
    setCostumeSpecs(initialCostumeSpecs);
    setIsCompleted(false);
    setAnalysisResult('');
    setAudioCache({});
    localStorage.removeItem('shanthi_audio_cache'); // Clear cache when starting fresh for a new dancer
  };

  const CompletionScreen = () => (
    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto animate-fade-in">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
        <CheckIcon className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready!</h2>
      <div className="text-gray-600 mb-6 text-left bg-gray-50 p-4 rounded-lg">
        <p className="font-semibold mb-2">Instructions:</p>
        <p><strong>Step 1:</strong> Download the PDF summary.</p>
        <p><strong>Step 2:</strong> Click "Share on WhatsApp" and attach the downloaded PDF to the message.</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => {
            const doc = generatePdf();
            doc.save(`Shanthi_Tailors_Order_${dancerName.replace(/ /g, '_')}.pdf`);
          }}
          className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <DownloadIcon className="w-6 h-6" /> Download PDF
        </button>
        <button
          onClick={() => {
            const summary = generateOrderSummaryText(true);
            const whatsappUrl = `https://wa.me/+919003326517?text=${encodeURIComponent("Hello Shanthi Tailors, please find the details below. I will attach the measurement PDF.\n\n" + summary)}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="w-full flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          <WhatsAppIcon className="w-6 h-6" /> Share on WhatsApp
        </button>
      </div>
      <button
        onClick={handleRestart}
        className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Start Next Measurement
      </button>
    </div>
  );

  const renderStep = () => {
    if (appMode === null) {
      return <ModeSelectionStep onSelectMode={(mode) => {
        handleAudioInit();
        setAppMode(mode);
      }} />;
    }
    if (isCompleted) return <CompletionScreen />;
    if (isWelcomeStep) {
        return <WelcomeStep 
          name={dancerName} 
          onNameChange={setDancerName}
          onNext={handleNext} 
        />
    }
    if (isMeasurementStep) {
        const measurementIndex = currentStep - 1;
        const measurement = measurements[measurementIndex];
        if (!measurement) return null;

        return <MeasurementStep
            dancerName={dancerName}
            measurement={measurement}
            measurementIndex={measurementIndex}
            prevMeasurement={measurementIndex > 0 ? measurements[measurementIndex - 1] : undefined}
            onValueChange={(value) => {
                const newMeasurements = [...measurements];
                newMeasurements[measurementIndex].value = value;
                setMeasurements(newMeasurements);
            }}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={currentStep === 1}
            isLast={currentStep === measurementStepsCount}
            audioCache={audioCache}
            onAddToCache={handleAddToCache}
            audioContext={audioContext}
        />
    }
    if (isMeasurementReviewStep) {
        return <MeasurementReviewStep 
          measurements={measurements}
          onEdit={(index) => setCurrentStep(index + 1)}
          onConfirmAndAnalyze={handleAnalyzeMeasurements}
          onPrev={handlePrev}
        />
    }
    if (isAnalysisStep) {
      return <AnalysisFeedbackStep 
        isAnalyzing={isAnalyzing}
        analysisResult={analysisResult}
        onEdit={() => setCurrentStep(measurementReviewStepIndex)}
        onProceed={handleProceedFromAnalysis}
        appMode={appMode}
      />
    }
    if (isDetailsStep && appMode === 'orderForm') {
      return <DetailsStep 
        customerDetails={customerDetails}
        costumeSpecs={costumeSpecs}
        onCustomerDetailsChange={(field, value) => setCustomerDetails(prev => ({...prev, [field]: value}))}
        onCostumeSpecsChange={(field, value) => setCostumeSpecs(prev => ({...prev, [field]: value}))}
        onBlouseTypeChange={(value) => setCostumeSpecs(prev => ({...prev, blouseType: value}))}
        onColorChoiceChange={(index, field, value) => {
          const newChoices = [...costumeSpecs.colorChoices];
          newChoices[index] = {...newChoices[index], [field]: value};
          setCostumeSpecs(prev => ({...prev, colorChoices: newChoices}));
        }}
        onPrev={handlePrev} 
        onNext={handleNext} 
      />
    }
    if (isReviewStep && appMode === 'orderForm') {
        return <ReviewStep 
            dancerName={dancerName}
            measurements={measurements} 
            customerDetails={customerDetails}
            costumeSpecs={costumeSpecs}
            onEdit={handleEdit} 
            onSubmit={handleFinalSubmit}
            isSubmitting={false}
        />
    }
    return null;
  }

  const progressTotal = appMode === 'orderForm' ? measurementStepsCount + 1 : measurementStepsCount;
  const progressCurrent = isDetailsStep ? measurementStepsCount : (isMeasurementStep ? currentStep - 1 : 0);
  const showProgressBar = appMode !== null && !isCompleted && !isWelcomeStep && !isReviewStep && !isAnalysisStep;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Shanthi Tailors - Measurement Tool</h1>
          <p className="text-gray-600 mt-2">A digital guide to your perfect dance costume.</p>
        </header>

        {showProgressBar && (
          <div className="mb-8">
            <ProgressBar current={progressCurrent} total={progressTotal} />
          </div>
        )}

        <main>
          {renderStep()}
        </main>
      </div>
       <footer className="text-center mt-12 text-gray-400 text-sm pb-8">
          <p className="mb-4">&copy; {new Date().getFullYear()} Shanthi Tailors Pvt. Ltd. All rights reserved.</p>
          
          <button 
            onClick={() => setShowAudioTools(!showAudioTools)}
            className="text-xs text-indigo-400 hover:text-indigo-600 underline"
          >
            {showAudioTools ? 'Hide Audio Manager' : 'Manage Audio Assets'}
          </button>

          {/* Audio Manager (Generator + Uploader) */}
          {showAudioTools && (
            <div className="mt-4 animate-fade-in">
                <AudioAssetsGenerator 
                    onLoadFiles={(files) => {
                        files.forEach(f => handleAddToCache(f.name.replace('.wav', ''), f.data));
                        // Close tool after loading to confirm success visually
                        alert(`Loaded ${files.length} audio files into memory.`);
                        setShowAudioTools(false); 
                    }}
                />
            </div>
          )}
      </footer>
    </div>
  );
};

export default App;