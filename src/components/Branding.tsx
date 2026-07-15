/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export const TCNLogo: React.FC<LogoProps> = ({
  className = "h-10",
  showText = true,
  textSize = "text-xl",
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* High-quality modern vector SVG Logo of TCN Tanzania */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full aspect-square filter drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]"
      >
        {/* Dynamic circular orbit ring (Orange & Green) */}
        <circle
          cx="250"
          cy="250"
          r="210"
          stroke="url(#tcn-ring-gradient)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeDasharray="900 300"
          transform="rotate(-45 250 250)"
        />
        {/* Vibrant Core Sphere with Tanzania's national color vibes */}
        <circle cx="250" cy="250" r="140" fill="url(#tcn-core-gradient)" />
        {/* Abstract streaming signal waves 'S' curved (Blue, Green, Orange) */}
        <path
          d="M170 250C170 205.817 205.817 170 250 170C294.183 170 330 205.817 330 250C330 294.183 294.183 330 250 330"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M200 250C200 222.386 222.386 200 250 200C277.614 200 300 222.386 300 250"
          stroke="#F97316"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Play symbol triangle centered (Represents Stream) */}
        <polygon points="235,215 285,250 235,285" fill="#10B981" />

        <defs>
          <linearGradient id="tcn-ring-gradient" x1="40" y1="40" x2="460" y2="460" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" /> {/* Royal Blue */}
            <stop offset="0.5" stopColor="#10B981" /> {/* Tanzania Green */}
            <stop offset="1" stopColor="#F97316" /> {/* Vibrant Orange */}
          </linearGradient>
          <linearGradient id="tcn-core-gradient" x1="110" y1="110" x2="390" y2="390" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" /> {/* Deep Dark Blue Background */}
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={`${textSize} font-sans font-bold tracking-wider text-white flex items-center gap-1`}>
          TCN <span className="bg-gradient-to-r from-emerald-400 via-orange-400 to-sky-400 bg-clip-text text-transparent">STREAM</span>
        </span>
      )}
    </div>
  );
};

export const BrandingInjector: React.FC = () => {
  useEffect(() => {
    // Dynamic tab updates for ultimate commercial Polish
    document.title = "TCN Stream - Premium Swahili & International Entertainment";

    // Create a dynamic premium favicon matching the logo
    const link: HTMLLinkElement =
      document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "shortcut icon";
    link.href = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="%230F172A" stroke="%23F97316" stroke-width="6"/>
        <polygon points="42,32 68,50 42,68" fill="%2310B981"/>
        <circle cx="50" cy="50" r="25" stroke="%230284C7" stroke-width="4" fill="none"/>
      </svg>
    `)}`;
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  return null;
};
