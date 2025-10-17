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
      const baseRotation = 5 * 360;
      const targetRotation = baseRotation + index * rotationPerSegment + Math.random() * rotationPerSegment;
      
      setRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        onResult(pickedId);
        setRotation(0);
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

      {/* Wheel */}
      <div 
        className="relative w-80 h-80 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
        }}
      >
        {entries.map(([id, person], i) => {
          const angle = (i * 360) / count;
          const hue = person.available ? (i * 360) / count : 0;
          const saturation = person.available ? '70%' : '10%';
          const lightness = person.available ? '45%' : '30%';
          
          return (
            <div
              key={id}
              className="absolute w-1/2 h-1/2 top-1/2 left-1/2 flex items-start justify-start p-4 font-bold text-white text-sm"
              style={{
                transformOrigin: '0% 0%',
                transform: `rotate(${angle}deg) translate(0, -50%)`,
                background: `conic-gradient(from ${angle}deg, hsl(${hue}, ${saturation}, ${lightness}), hsl(${hue}, ${saturation}, ${parseInt(lightness) + 10}%))`,
                textShadow: '0 0 4px rgba(0,0,0,0.8)'
              }}
            >
              {id}
            </div>
          );
        })}
        
        {/* Center decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl shadow-lg">
          🎁
        </div>
      </div>
    </div>
  );
});

ChristmasWheel.displayName = 'ChristmasWheel';

export default ChristmasWheel;
