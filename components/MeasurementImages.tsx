import React from 'react';

// Common props for SVGs
const SvgWrapper: React.FC<React.PropsWithChildren<React.SVGProps<SVGSVGElement>>> = ({ children, ...props }) => (
  <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" {...props}>
    <style>
      {`
        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}
    </style>
    {children}
  </svg>
);

// --- Base Body Components ---

// A more proportional female fashion croquis style outline (Front)
const BodyFront: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
     {/* Head & Neck */}
    <path d="M150,50 Q165,50 165,68 Q165,85 150,85 Q135,85 135,68 Q135,50 150,50 Z" /> {/* Head */}
    <path d="M150,85 L150,100" /> {/* Neck Center */}
    <path d="M138,95 Q138,105 120,110" /> {/* Shoulder L */}
    <path d="M162,95 Q162,105 180,110" /> {/* Shoulder R */}

    {/* Torso */}
    <path d="M120,110 L115,135" /> {/* Armpit L */}
    <path d="M180,110 L185,135" /> {/* Armpit R */}
    
    <path d="M115,135 Q115,160 125,185" /> {/* Side L to Waist */}
    <path d="M185,135 Q185,160 175,185" /> {/* Side R to Waist */}
    
    <path d="M125,185 Q110,210 110,235" /> {/* Waist L to Hip */}
    <path d="M175,185 Q190,210 190,235" /> {/* Waist R to Hip */}

    {/* Legs */}
    <path d="M110,235 L115,350 Q118,370 115,390 L112,450" /> {/* Leg Outer L */}
    <path d="M190,235 L185,350 Q182,370 185,390 L188,450" /> {/* Leg Outer R */}
    
    <path d="M150,235 L145,350 Q142,370 145,390 L142,450" /> {/* Leg Inner L */}
    <path d="M150,235 L155,350 Q158,370 155,390 L158,450" /> {/* Leg Inner R */}

    {/* Feet */}
    <path d="M112,450 L105,470 L130,470 L142,450" />
    <path d="M188,450 L195,470 L170,470 L158,450" />

    {/* Arms (Relaxed) */}
    <path d="M120,110 Q100,150 100,200 L105,250" /> {/* Arm Outer L */}
    <path d="M115,135 Q110,150 110,180 L115,200" /> {/* Arm Inner L */}
    
    <path d="M180,110 Q200,150 200,200 L195,250" /> {/* Arm Outer R */}
    <path d="M185,135 Q190,150 190,180 L185,200" /> {/* Arm Inner R */}

    {/* Context Lines (Faint) */}
    <path d="M125,185 Q150,195 175,185" strokeDasharray="2,2" opacity="0.5" /> {/* Waist Line */}
    <path d="M110,235 Q150,245 190,235" strokeDasharray="2,2" opacity="0.5" /> {/* Hip Line */}
    <path d="M115,135 Q150,150 185,135" strokeDasharray="2,2" opacity="0.5" /> {/* Bust Line */}
  </g>
);

// Body Front with Bent Arm (for sleeve length)
const BodyFrontBentArm: React.FC = () => (
    <g stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Reuse most of body */}
        <path d="M150,50 Q165,50 165,68 Q165,85 150,85 Q135,85 135,68 Q135,50 150,50 Z" />
        <path d="M150,85 L150,100" />
        <path d="M138,95 Q138,105 120,110" />
        <path d="M162,95 Q162,105 180,110" />
        <path d="M120,110 L115,135 Q115,160 125,185 Q110,210 110,235 L115,350 L112,450" />
        <path d="M180,110 L185,135 Q185,160 175,185 Q190,210 190,235 L185,350 L188,450" />
        <path d="M150,235 L145,350 L142,450" />
        <path d="M150,235 L155,350 L158,450" />
        <path d="M112,450 L105,470 L130,470 L142,450" />
        <path d="M188,450 L195,470 L170,470 L158,450" />
        
        {/* Left Arm (Relaxed) */}
        <path d="M120,110 Q100,150 100,200 L105,250" />
        <path d="M115,135 L115,200" />

        {/* Right Arm (Bent) */}
        <path d="M180,110 Q200,140 205,170" /> {/* Shoulder to Elbow Outer */}
        <path d="M205,170 L230,160" /> {/* Elbow to Wrist Outer */}
        
        <path d="M185,135 Q190,150 192,165" /> {/* Armpit to Elbow Inner */}
        <path d="M192,165 L220,155" /> {/* Elbow to Wrist Inner */}
    </g>
)

// Body Back View
const BodyBack: React.FC = () => (
  <g stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M150,50 Q165,50 165,68 Q165,85 150,85 Q135,85 135,68 Q135,50 150,50 Z" />
    <path d="M150,85 L150,100" />
    <path d="M138,95 Q138,105 120,110" />
    <path d="M162,95 Q162,105 180,110" />
    <path d="M120,110 L115,135 Q115,160 125,185 Q110,210 110,235" />
    <path d="M180,110 L185,135 Q185,160 175,185 Q190,210 190,235" />
    <path d="M110,235 L115,350 L112,450" />
    <path d="M190,235 L185,350 L188,450" />
    <path d="M150,235 L145,350 L142,450" />
    <path d="M150,235 L155,350 L158,450" />
    <path d="M112,450 L105,470 L130,470 L142,450" />
    <path d="M188,450 L195,470 L170,470 L158,450" />
    <path d="M120,110 Q100,150 100,200 L105,250" />
    <path d="M180,110 Q200,150 200,200 L195,250" />
    
    {/* Spine hint */}
    <path d="M150,100 L150,235" strokeDasharray="2,2" opacity="0.5" />
  </g>
);


// --- Helper for Highlights ---
const MeasurementLine: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
    <g stroke="#4F46E5" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                // If it has strokeDasharray, don't animate with the draw effect to preserve dash pattern
                if (child.props.strokeDasharray) {
                    return child;
                }
                // Apply drawing animation to solid lines/paths
                return React.cloneElement(child as React.ReactElement<any>, {
                    style: {
                        ...child.props.style,
                        strokeDasharray: 1000,
                        strokeDashoffset: 1000,
                        animation: 'drawLine 1.5s ease-out forwards',
                    }
                });
            }
            return child;
        })}
    </g>
);

const Label: React.FC<{x: number, y: number, text: string}> = ({x, y, text}) => (
    <g style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1s forwards' }}>
        <circle cx={x} cy={y} r="10" fill="#4F46E5" />
        <text x={x} y={y} dy="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">{text}</text>
    </g>
);

const LabelText: React.FC<{x: number, y: number, text: string}> = ({x, y, text}) => (
    <text x={x} y={y} fill="#4F46E5" fontSize="14" fontWeight="bold" fontFamily="sans-serif" style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 1s forwards' }}>{text}</text>
);

// --- Individual Measurement Components ---

export const UpToKneeLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Waist (150, 185) to Knee (150, 350) */}
      <path d="M135,185 L135,350" />
      <line x1="125" y1="185" x2="145" y2="185" strokeWidth="2" />
      <line x1="125" y1="350" x2="145" y2="350" strokeWidth="2" />
    </MeasurementLine>
    <Label x={135} y={185} text="1" />
    <Label x={135} y={350} text="2" />
  </SvgWrapper>
);

export const SkirtLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Waist to Skirt Hem (similar to full length but distinct label) */}
      <path d="M165,185 L165,420" />
      <line x1="155" y1="185" x2="175" y2="185" strokeWidth="2" />
      <line x1="155" y1="420" x2="175" y2="420" strokeWidth="2" />
    </MeasurementLine>
    <LabelText x={175} y={420} text="Skirt" />
  </SvgWrapper>
);

export const FullLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Waist to Ankle */}
      <path d="M135,185 L135,440" />
      <line x1="125" y1="185" x2="145" y2="185" strokeWidth="2" />
      <line x1="125" y1="440" x2="145" y2="440" strokeWidth="2" />
    </MeasurementLine>
    <Label x={135} y={440} text="3" />
  </SvgWrapper>
);

export const AroundHipImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Hip Circumference */}
      <ellipse cx="150" cy="235" rx="50" ry="12" />
    </MeasurementLine>
    <Label x={210} y={235} text="4" />
  </SvgWrapper>
);

export const WaistImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
       {/* Waist Circumference */}
       <ellipse cx="150" cy="185" rx="40" ry="10" />
    </MeasurementLine>
    <Label x={200} y={185} text="5" />
  </SvgWrapper>
);

export const AroundAnkleTightImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Ankle Circumference */}
      <ellipse cx="127" cy="445" rx="15" ry="5" />
    </MeasurementLine>
    <Label x={90} y={445} text="6" />
  </SvgWrapper>
);

export const UpperClothLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Left Waist (Side) -> Right Shoulder (Outer) */}
      <path d="M125,185 L180,110" />
    </MeasurementLine>
    <LabelText x={110} y={190} text="L.Waist" />
    <LabelText x={190} y={105} text="R.Shldr" />
  </SvgWrapper>
);

export const BackLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyBack />
    <MeasurementLine>
      {/* Waist to Butt Curve (approx y=235) on the SIDE of the buttock */}
      {/* Offset x to 175 to be on the right buttock */}
      <path d="M175,185 L175,235" />
      <line x1="165" y1="185" x2="185" y2="185" strokeWidth="2" />
      {/* Small curve at the bottom to indicate butt curve */}
      <path d="M165,235 Q175,245 185,235" fill="none" strokeWidth="2" /> 
    </MeasurementLine>
    <Label x={190} y={210} text="9" />
  </SvgWrapper>
);

export const ShoulderToBustPointImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Shoulder to Bust Peak */}
      <path d="M138,110 L135,145" />
      <circle cx="135" cy="145" r="3" fill="#4F46E5" />
    </MeasurementLine>
    <LabelText x={130} y={100} text="A" />
    <LabelText x={145} y={150} text="B" />
  </SvgWrapper>
);

export const ShoulderToBelowBustImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
       {/* Shoulder to Below Bust */}
       <path d="M138,110 L135,165" />
       <line x1="125" y1="165" x2="145" y2="165" strokeWidth="2" />
    </MeasurementLine>
    <LabelText x={130} y={100} text="A" />
    <LabelText x={145} y={170} text="C" />
  </SvgWrapper>
);

export const BlouseFullLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Shoulder to Blouse Hem (usually below bust/mid waist) */}
      <path d="M138,110 L135,200" />
      <line x1="125" y1="200" x2="145" y2="200" strokeWidth="2" />
    </MeasurementLine>
    <LabelText x={130} y={100} text="A" />
  </SvgWrapper>
);

export const AroundAboveBustImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* High Chest */}
      <path d="M115,130 Q150,140 185,130" fill="none" />
      <path d="M115,130 Q150,120 185,130" strokeDasharray="4,4" strokeWidth="2" />
    </MeasurementLine>
    <LabelText x={200} y={130} text="D" />
  </SvgWrapper>
);

export const AroundOnBustImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Full Bust */}
      <ellipse cx="150" cy="145" rx="45" ry="10" />
    </MeasurementLine>
    <LabelText x={205} y={150} text="E" />
  </SvgWrapper>
);

export const SleeveAroundImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFront opacity={0.5} />
    <MeasurementLine>
      {/* Bicep */}
      <ellipse cx="102" cy="150" rx="15" ry="6" transform="rotate(10 102 150)" />
    </MeasurementLine>
    <LabelText x={75} y={150} text="G" />
  </SvgWrapper>
);

export const CenterBackToShoulderImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyBack />
    <MeasurementLine>
      {/* Center Neck to Shoulder Tip */}
      <path d="M150,90 L180,110" />
      <circle cx="150" cy="90" r="3" fill="#4F46E5" />
      <circle cx="180" cy="110" r="3" fill="#4F46E5" />
    </MeasurementLine>
    <LabelText x={145} y={80} text="H" />
    <LabelText x={185} y={105} text="I" />
  </SvgWrapper>
);

export const SleeveLengthImage: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SvgWrapper {...props}>
    <BodyFrontBentArm />
    <MeasurementLine>
      {/* Bent Arm: Shoulder -> Above Elbow */}
      {/* Shoulder (180, 110) to above elbow (approx 192, 140) */}
      <path d="M180,110 L195,140" />
      <circle cx="180" cy="110" r="3" fill="#4F46E5" />
      <circle cx="195" cy="140" r="3" fill="#4F46E5" />
    </MeasurementLine>
    <LabelText x={170} y={100} text="I" />
    <LabelText x={205} y={145} text="J" />
  </SvgWrapper>
);