
import React, { useState, useEffect } from 'react';

interface WaveformProps {
  isPaused: boolean;
  isActive: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ isPaused, isActive }) => {
  const [bars, setBars] = useState<number[]>(Array(40).fill(10));

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 w-full max-w-md overflow-hidden">
      {bars.map((height, idx) => (
        <div
          key={idx}
          className={`w-1 rounded-full transition-all duration-150 ${
            isPaused ? 'bg-gray-300' : 'bg-blue-500'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};

export default Waveform;
