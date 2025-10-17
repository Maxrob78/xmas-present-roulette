import { useState, forwardRef, useImperativeHandle } from 'react';

interface Person {
  id: string;
  available: boolean;
  assignedTo: string | null;
}

interface ChristmasWheelProps {
  people: Record<string, Person>;
  currentUser: string | null;
  onResult: (picked: string) => void;
}

export interface ChristmasWheelRef {
  spin: (pickedId: string) => void;
}

const ChristmasWheel = forwardRef<ChristmasWheelRef, ChristmasWheelProps>(
  ({ people, currentUser, onResult }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const entries = Object.entries(people).filter(([id]) => id !== currentUser);
    const count = entries.length;

    const spin = (pickedId: string) => {
      if (isSpinning) return;
      setIsSpinning(true);

      const index = entries.findIndex(([id]) => id === pickedId);
      const rotationPerSegment = 360 / count;
      
      // Calculer l'angle pour que le segment soit EN HAUT (pointeur)
      // L'indicateur pointe vers le bas de la roue (en haut de l'écran)
      // On veut que le CENTRE du segment soit aligné avec le pointeur
      const segmentCenterAngle = index * rotationPerSegment + rotationPerSegment / 2;
      
      // On fait 5 tours complets + rotation pour aligner le segment
      // On SOUSTRAIT l'angle pour que le segment arrive sous le pointeur
      const baseRotation = 5 * 360;
      const targetRotation = baseRotation - segmentCenterAngle;
      
      setRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        onResult(pickedId);
        // Reset à 0 pour la prochaine rotation
        setTimeout(() => setRotation(0), 100);
      }, 4200);
    };

    useImperativeHandle(ref, () => ({
      spin
    }));

  return (
    <div className="relative">
      {/* Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
        <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-l-transparent border-r-transparent border-b-primary drop-shadow-[0_0_8px_hsl(var(--christmas-red))]" />
      </div>

      {/* Wheel - Using SVG for clean rendering */}
      <div 
        className="relative w-80 h-80"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {entries.map(([id, person], i) => {
            const startAngle = (i * 360) / count;
            const endAngle = ((i + 1) * 360) / count;
            const hue = person.available ? (i * 360) / count : 0;
            const saturation = person.available ? 70 : 10;
            const lightness = person.available ? 50 : 30;
            
            // Convert angles to radians for path calculation
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            // Calculate path points
            const x1 = 200 + 200 * Math.cos(startRad);
            const y1 = 200 + 200 * Math.sin(startRad);
            const x2 = 200 + 200 * Math.cos(endRad);
            const y2 = 200 + 200 * Math.sin(endRad);
            
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            
            // Text position (middle of segment)
            const textAngle = (startAngle + endAngle) / 2;
            const textRad = (textAngle - 90) * Math.PI / 180;
            const textX = 200 + 130 * Math.cos(textRad);
            const textY = 200 + 130 * Math.sin(textRad);
            
            return (
              <g key={id}>
                <defs>
                  <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` }} />
                    <stop offset="100%" style={{ stopColor: `hsl(${hue}, ${saturation}%, ${lightness + 10}%)` }} />
                  </linearGradient>
                </defs>
                <path
                  d={`M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={`url(#gradient-${i})`}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  style={{ 
                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    transform: `rotate(${textAngle}deg)`,
                    transformOrigin: `${textX}px ${textY}px`
                  }}
                >
                  {id}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Center decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl shadow-lg z-10">
          🎁
        </div>
      </div>
    </div>
  );
});

ChristmasWheel.displayName = 'ChristmasWheel';

export default ChristmasWheel;
