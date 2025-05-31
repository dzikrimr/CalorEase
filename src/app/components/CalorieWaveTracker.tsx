"use client";
import React, { useState, useEffect } from "react";

interface CalorieWaveTrackerProps {
  current: number;
  target: number;
  size?: number;
  label: string;
}

const CalorieWaveTracker: React.FC<CalorieWaveTrackerProps> = ({ current, target, size = 64, label }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Calculate percentage (0-100%)
  const percentage = Math.min((current / target) * 100, 100);

  // Set percentage without animation
  useEffect(() => {
    setAnimatedPercentage(percentage);
  }, [percentage]);

  // Add wave bob animation CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes waveBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Determine if current calories exceed target
  const isOverLimit = current > target;
  const waveColor = isOverLimit ? "#ef4444" : "#0d9488";

  // Calculate wave fill height
  const fillHeight = (animatedPercentage / 100) * (size - 8);
  const waveTop = size - fillHeight - 4;

  // SVG path for static wavy effect
  const wavePath = `
    M 0 ${waveTop + 4}
    C ${size * 0.25} ${waveTop - 4}, ${size * 0.75} ${waveTop + 8}, ${size} ${waveTop + 4}
    L ${size} ${size + 10}
    L 0 ${size + 10}
    Z
  `;

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-2 text-teal-800 text-sm font-medium">
        {label}
      </div>

      <div
        className="relative rounded-full border-2 border-gray-200 overflow-hidden mx-auto bg-white"
        style={{ width: size, height: size }}
      >
        {/* Wave fill with static wavy shape using SVG and subtle up-down animation */}
        <svg
          width={size}
          height={size + 10}
          style={{
            position: "absolute",
            bottom: -5,
            left: 0,
            animation: "waveBob 2s ease-in-out infinite",
          }}
        >
          <path d={wavePath} fill={waveColor} opacity="0.4" />
        </svg>

        {/* Circular mask */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 70%, white 71%)`,
          }}
        />

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className={`font-bold text-sm ${isOverLimit ? "text-red-600" : "text-teal-700"}`}
            style={{ textShadow: "0 0 3px rgba(255,255,255,0.8)" }}
          >
            {Math.round(current)}
          </div>
        </div>

        {/* Overflow indicator */}
        {isOverLimit && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full z-20">
            <div className="absolute inset-0 bg-red-400 rounded-full opacity-75"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalorieWaveTracker;