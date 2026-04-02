"use client";

import { motion } from "framer-motion";

type Props = {
  value: number;
  className?: string;
};

/** Semi-circle gauge (0–100) with SVG arc + gradient stroke. */
export function RiskGauge({ value, className }: Props) {
  const clamped = Math.min(100, Math.max(0, value));
  const size = 280;
  const stroke = 14;
  const r = (size - stroke) / 2 - 4;
  const cx = size / 2;
  const cy = size / 2 - 8;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = startAngle - endAngle;
  const pct = clamped / 100;
  const arcLen = r * totalAngle;
  const dashOffset = arcLen * (1 - pct);

  const describeArc = () => {
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const trackPath = describeArc();

  const color =
    clamped < 35
      ? "#10B981"
      : clamped < 60
        ? "#3B82F6"
        : clamped < 80
          ? "#F59E0B"
          : "#EF4444";

  return (
    <div className={className}>
      <svg
        width={size}
        height={size / 2 + 36}
        viewBox={`0 0 ${size} ${size / 2 + 36}`}
        className="mx-auto overflow-visible"
        aria-label={`Risk score ${clamped} out of 100`}
        role="img"
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="45%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d={trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="text-[#2a2a30]"
        />
        <motion.path
          d={trackPath}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          initial={{ strokeDashoffset: arcLen }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          style={{ filter: `drop-shadow(0 0 12px ${color}55)` }}
        />
      </svg>
      <div className="-mt-14 flex flex-col items-center text-center">
        <motion.span
          className="font-heading text-5xl font-semibold tabular-nums tracking-tight text-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          key={clamped}
        >
          {clamped}
        </motion.span>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Risk index
        </span>
      </div>
    </div>
  );
}
