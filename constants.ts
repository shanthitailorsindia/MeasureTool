import type { Measurement } from './types';
import {
  UpToKneeLengthImage,
  SkirtLengthImage,
  FullLengthImage,
  AroundHipImage,
  WaistImage,
  AroundAnkleTightImage,
  UpperClothLengthImage,
  BackLengthImage,
  ShoulderToBustPointImage,
  ShoulderToBelowBustImage,
  BlouseFullLengthImage,
  AroundAboveBustImage,
  AroundOnBustImage,
  SleeveAroundImage,
  CenterBackToShoulderImage,
  SleeveLengthImage
} from './components/MeasurementImages';

export const MEASUREMENT_STEPS: Measurement[] = [
  // For Pants/Skirt (Previously Dance Dress)
  {
    id: 'upToKneeLength',
    name: '1-2. Up to Knee Length',
    description: 'As shown by 1-2 in the diagram, measure from the natural waistline down to the top of the kneecap. This is often used for practice sarees.',
    imageComponent: UpToKneeLengthImage,
    category: 'For Pants/Skirt',
    audioTip: 'Measure from your natural waist, down to the top of your knee cap.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/upToKneeLength.wav?v=1765883449'
  },
  {
    id: 'skirtLength',
    name: '2. Skirt Length',
    description: 'Measure from the natural waistline down to the desired length of the skirt.',
    imageComponent: SkirtLengthImage,
    category: 'For Pants/Skirt',
    audioTip: 'Measure from your waist down to where you want the skirt to end.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/skirtLength.wav?v=1765883449'
  },
  {
    id: 'fullLength',
    name: '3. Full Length*',
    description: 'Measure from the natural waistline (naval line) down to the ankle bone (point 3). *Required for all costume types.',
    imageComponent: FullLengthImage,
    category: 'For Pants/Skirt',
    audioTip: 'Start at your navel line and measure straight down to the ankle bone.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/fullLength.wav?v=1765883449'
  },
  {
    id: 'aroundHip',
    name: '4. Around Hip*',
    description: 'Measure around the widest part of your hips and buttocks, keeping the tape measure parallel to the floor. Ensure a snug fit. *Required for all costume types.',
    imageComponent: AroundHipImage,
    category: 'For Pants/Skirt',
    audioTip: 'Wrap the tape around the fullest part of your hips, keeping it level.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/aroundHip.wav?v=1765883449'
  },
  {
    id: 'waist',
    name: '5. Waist*',
    description: 'Measure around your natural waistline, which is the narrowest part of your torso (usually just above the belly button). *Required for all costume types.',
    imageComponent: WaistImage,
    category: 'For Pants/Skirt',
    audioTip: 'Find the narrowest part of your torso and measure around it.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/waist.wav?v=1765883449'
  },
  {
    id: 'aroundAnkleTight',
    name: '6. Around Ankle (Tight)',
    description: 'Measure snugly around your ankle bone. This is important for pants or pyjamas that need to be fitted at the bottom.',
    imageComponent: AroundAnkleTightImage,
    category: 'For Pants/Skirt',
    audioTip: 'Wrap the tape snugly around your ankle bone.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/aroundAnkleTight.wav?v=1765883449'
  },
  {
    id: 'upperClothLength',
    name: '7-8-7. Upper Cloth Length',
    description: 'Measure from the left waist (where you wear the pant) to the right shoulder.',
    imageComponent: UpperClothLengthImage,
    category: 'For Pants/Skirt',
    audioTip: 'Measure diagonally from your left waist, where you wear your pants, up to your right shoulder.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/upperClothLength.wav?v=1765883450'
  },
  // For Choli/Blouse
  {
    id: 'backLength',
    name: '9. Back Length*',
    description: 'Measure from the natural waistline down to the curve of the buttocks. *Required for all costume types.',
    imageComponent: BackLengthImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure from your waist down to the fullest part of your seat.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/backLength.wav?v=1765883449'
  },
  {
    id: 'shoulderToBustPoint',
    name: 'A-B. From Shoulder to Point of Bust',
    description: 'Measure from the top of the shoulder (point A) down to the fullest point of the bust (point B). This helps in placing darts correctly.',
    imageComponent: ShoulderToBustPointImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure from the top of your shoulder straight down to the tip of your bust.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/shoulderToBustPoint.wav?v=1765883450'
  },
  {
    id: 'shoulderToBelowBust',
    name: 'A-C. From Shoulder to Below Bust',
    description: 'Measure from the top of the shoulder (point A) down to just under the bust (point C). This determines the length of the choli\'s upper part.',
    imageComponent: ShoulderToBelowBustImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure from the top of your shoulder down to the band of your bra.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/shoulderToBelowBust.wav?v=1765883449'
  },
  {
    id: 'blouseFullLength',
    name: 'Blouse Full Length*',
    description: 'Measure from the top of the shoulder (point A) down to the desired length of the blouse in the front. *Required for all costume types.',
    imageComponent: BlouseFullLengthImage,
    category: 'For Choli/Blouse',
    audioTip: 'From the top of your shoulder, measure down to where you want the blouse to end.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/blouseFullLength.wav?v=1765883449'
  },
  {
    id: 'aroundAboveBust',
    name: 'D. Around Above Bust*',
    description: 'Measure around your torso, just under your armpits and above your bust. Keep the tape high and snug. *Required for all costume types.',
    imageComponent: AroundAboveBustImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure around your body, high up under your armpits.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/aroundAboveBust.wav?v=1765883375'
  },
  {
    id: 'aroundOnBust',
    name: 'E. Around on Bust*',
    description: 'Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor. *Required for all costume types.',
    imageComponent: AroundOnBustImage,
    category: 'For Choli/Blouse',
    audioTip: 'Wrap the tape around the fullest part of your bust, keeping it level.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/aroundOnBust.wav?v=1765883449'
  },
  {
    id: 'sleeveAround',
    name: 'G. Sleeve Around*',
    description: 'Measure around the fullest part of your bicep with your arm relaxed at your side. *Required for all costume types.',
    imageComponent: SleeveAroundImage,
    category: 'For Choli/Blouse',
    audioTip: 'With your arm relaxed, measure around the widest part of your bicep.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/sleeveAround.wav?v=1765883450'
  },
  {
    id: 'centerBackToShoulder',
    name: 'H-I. Centre Back Bone to Shoulder*',
    description: 'Measure from the center bone at the base of your neck (point H) across to the tip of your shoulder bone (point I). *Required for all costume types.',
    imageComponent: CenterBackToShoulderImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure from the prominent bone at the base of your neck to the edge of your shoulder.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/centerBackToShoulder.wav?v=1765883449'
  },
  {
    id: 'sleeveLength',
    name: 'I-J. Sleeve Length*',
    description: 'Measure from the shoulder bone down to the desired sleeve length.',
    imageComponent: SleeveLengthImage,
    category: 'For Choli/Blouse',
    audioTip: 'Measure from the edge of your shoulder down your arm to your desired sleeve length.',
    audioUrl: 'https://cdn.shopify.com/s/files/1/0738/4265/5537/files/sleeveLength.wav?v=1765883449'
  },
];