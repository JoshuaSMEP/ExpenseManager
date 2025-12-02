import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { GlassCard } from '../components/ui';
import { useStore } from '../store/useStore';
import { formatCurrency, getCategoryIcon, getCategoryLabel } from '../utils/formatters';

// ============================================================================
// ANIMATED COUNTER - Counts up with easing and comma formatting
// ============================================================================
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '', decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => {
    const formatted = current.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {display}
    </motion.span>
  );
}

// ============================================================================
// GLOWING PROGRESS RING - Circular progress with glowing trail
// ============================================================================
interface GlowingProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function GlowingProgressRing({ value, max, size = 200, strokeWidth = 12, label }: GlowingProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const spring = useSpring(circumference, { duration: 2000, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      spring.set(strokeDashoffset);
    }
  }, [isInView, strokeDashoffset, spring]);

  const isOverBudget = value > max;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Animated glow orbs behind the ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 rounded-full opacity-30"
          style={{
            background: isOverBudget
              ? 'radial-gradient(circle, rgba(255, 100, 100, 0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0, 245, 255, 0.6) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <svg ref={ref} width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOverBudget ? 'url(#gradient-danger)' : 'url(#gradient-primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: spring }}
          filter="url(#glow)"
        />
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="50%" stopColor="#00f5a0" />
            <stop offset="100%" stopColor="#00ddeb" />
          </linearGradient>
          <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#ff8e53" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <p className="text-3xl font-bold text-white">
            <AnimatedCounter value={percentage} suffix="%" decimals={0} />
          </p>
          {label && <p className="text-white/60 text-sm mt-1">{label}</p>}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// SPARKLINE CHART - Self-drawing mini chart
// ============================================================================
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

function Sparkline({ data, width = 200, height = 60, color = '#00f5ff', showArea = true }: SparklineProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 4;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((max - value) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg ref={ref} width={width} height={height} className="overflow-visible">
      {/* Area fill with gradient */}
      {showArea && (
        <motion.polygon
          points={areaPoints}
          fill="url(#sparkline-gradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.3 } : {}}
          transition={{ duration: 1, delay: 1 }}
        />
      )}
      {/* Line */}
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : {}}
        transition={{ duration: 2, ease: 'easeOut' }}
        filter="url(#sparkline-glow)"
      />
      {/* End dot */}
      <motion.circle
        cx={width - padding}
        cy={padding + ((max - data[data.length - 1]) / range) * (height - padding * 2)}
        r="4"
        fill={color}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 2, type: 'spring' }}
      />
      {/* Definitions */}
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="sparkline-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ============================================================================
// ANIMATED DONUT CHART - Category breakdown with hover effects
// ============================================================================
interface DonutChartProps {
  data: { label: string; value: number; color: string; icon: string }[];
  size?: number;
}

function AnimatedDonutChart({ data, size = 240 }: DonutChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Add a small gap between segments (2 degrees per segment)
  const gapAngle = 2;
  const totalGapAngle = gapAngle * data.length;
  const availableAngle = 360 - totalGapAngle;

  let accumulatedAngle = 0;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * availableAngle;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle + gapAngle;
    const dashArray = (angle / 360) * circumference;
    const dashOffset = circumference - dashArray;
    const rotation = startAngle - 90;

    return { ...item, startAngle, angle, dashArray, dashOffset, rotation, index };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg ref={ref} width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((segment, i) => (
          <motion.circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={hoveredIndex === i ? strokeWidth + 8 : strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${segment.dashArray} ${circumference}`}
            strokeDashoffset={0}
            style={{ transform: `rotate(${segment.rotation}deg)`, transformOrigin: 'center' }}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={isInView ? { strokeDasharray: `${segment.dashArray} ${circumference}` } : {}}
            transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            filter={hoveredIndex === i ? 'url(#segment-glow)' : undefined}
            className="cursor-pointer transition-all duration-300"
          />
        ))}
        <defs>
          <filter id="segment-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {hoveredIndex !== null ? (
            <motion.div
              key={hoveredIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <span className="text-3xl mb-1">{segments[hoveredIndex].icon}</span>
              <p className="text-white font-bold text-lg">{formatCurrency(segments[hoveredIndex].value)}</p>
              <p className="text-white/60 text-sm">{segments[hoveredIndex].label}</p>
            </motion.div>
          ) : (
            <motion.div
              key="total"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-white font-bold text-2xl">{formatCurrency(total)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// 3D TILT MERCHANT CARD
// ============================================================================
interface MerchantCardProps {
  name: string;
  amount: number;
  count: number;
  icon: string;
  gradient: string;
  index: number;
}

function MerchantCard({ name, amount, count, icon, gradient, index }: MerchantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Card background with gradient */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(30, 30, 50, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px',
        }}
      >

        {/* Gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ background: gradient }}
        />

        <div className="relative z-10" style={{ margin: '10px' }}>
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: gradient }}
            >
              {icon}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 45 }}
              className="p-2 rounded-full bg-white/10"
            >
              <ArrowUpRight className="w-4 h-4 text-white/60" />
            </motion.div>
          </div>

          <h3 className="text-white font-semibold text-base mb-2">{name}</h3>
          <p className="text-white/50 text-sm mb-4">{count} transactions</p>

          <div className="flex items-end justify-between">
            <p className="text-xl font-bold text-white">{formatCurrency(amount)}</p>
            <Sparkline
              data={[amount * 0.3, amount * 0.5, amount * 0.4, amount * 0.7, amount * 0.6, amount * 0.9, amount]}
              width={70}
              height={25}
              color="#00f5ff"
              showArea={false}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// ANIMATED AREA CHART - Monthly trends
// ============================================================================
interface AreaChartProps {
  data: { month: string; value: number; prevValue?: number }[];
  height?: number;
}

function AnimatedAreaChart({ data, height = 200 }: AreaChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current?.parentElement) {
        setContainerWidth(ref.current.parentElement.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const width = containerWidth;
  const padding = { top: 20, right: 30, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.prevValue || 0)));

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxValue) * chartHeight;

  const currentPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ');
  const currentArea = `M ${padding.left} ${height - padding.bottom} ${data.map((d, i) => `L ${getX(i)} ${getY(d.value)}`).join(' ')} L ${getX(data.length - 1)} ${height - padding.bottom} Z`;

  const prevPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.prevValue || 0)}`).join(' ');

  return (
    <div className="relative w-full">
      <svg ref={ref} width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={width - padding.right}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
        ))}

        {/* Previous period area (subtle) */}
        <motion.path
          d={`M ${padding.left} ${height - padding.bottom} ${data.map((d, i) => `L ${getX(i)} ${getY(d.prevValue || 0)}`).join(' ')} L ${getX(data.length - 1)} ${height - padding.bottom} Z`}
          fill="url(#prev-gradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.2 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Previous period line */}
        <motion.path
          d={prevPath}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 2 }}
        />

        {/* Current period area */}
        <motion.path
          d={currentArea}
          fill="url(#area-gradient)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
        />

        {/* Current period line with glow */}
        <motion.path
          d={currentPath}
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#chart-glow)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 2 }}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={getX(i)}
              cy={getY(d.value)}
              r={hoveredIndex === i ? 8 : 5}
              fill="#00f5ff"
              filter="url(#point-glow)"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 2 + i * 0.1, type: 'spring' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            />
            {/* X-axis labels */}
            <text
              x={getX(i)}
              y={height - 10}
              fill="rgba(255,255,255,0.5)"
              fontSize="12"
              textAnchor="middle"
            >
              {d.month}
            </text>
          </motion.g>
        ))}

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <rect
                x={getX(hoveredIndex) - 45}
                y={getY(data[hoveredIndex].value) - 45}
                width="90"
                height="36"
                rx="8"
                fill="rgba(30, 30, 50, 0.95)"
                stroke="rgba(0, 245, 255, 0.3)"
              />
              <text
                x={getX(hoveredIndex)}
                y={getY(data[hoveredIndex].value) - 22}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                {formatCurrency(data[hoveredIndex].value)}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Gradients */}
        <defs>
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f5ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="prev-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="50%" stopColor="#00f5a0" />
            <stop offset="100%" stopColor="#00ddeb" />
          </linearGradient>
          <filter id="chart-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="point-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ============================================================================
// SPENDING HEATMAP CALENDAR
// ============================================================================
interface HeatmapProps {
  data: { date: string; value: number }[];
}

function SpendingHeatmap({ data }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; value: number; x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const maxValue = Math.max(...data.map(d => d.value));
  const weeks = 12;
  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const getIntensity = (value: number) => {
    if (value === 0) return 'rgba(255, 255, 255, 0.05)';
    const ratio = value / maxValue;
    if (ratio < 0.25) return 'rgba(0, 245, 255, 0.2)';
    if (ratio < 0.5) return 'rgba(0, 245, 255, 0.4)';
    if (ratio < 0.75) return 'rgba(0, 245, 255, 0.6)';
    return 'rgba(0, 245, 255, 0.9)';
  };

  return (
    <div ref={ref} className="relative" style={{ padding: '15px' }}>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-white/40 pr-3" style={{ minWidth: '32px' }}>
          {days.map((day, i) => (
            <div key={i} className="h-4 flex items-center">{day}</div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex;
                const dayData = data[dataIndex] || { date: '', value: 0 };

                return (
                  <motion.div
                    key={dayIndex}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                    className="w-4 h-4 rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10"
                    style={{
                      background: getIntensity(dayData.value),
                      boxShadow: dayData.value > maxValue * 0.5 ? '0 0 8px rgba(0, 245, 255, 0.5)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = ref.current?.getBoundingClientRect();
                      if (parentRect) {
                        setHoveredDay({
                          ...dayData,
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDay && hoveredDay.value > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-20 px-3 py-2 rounded-lg"
            style={{
              left: hoveredDay.x,
              top: hoveredDay.y - 45,
              transform: 'translateX(-50%)',
              background: 'rgba(30, 30, 50, 0.95)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
            }}
          >
            <p className="text-white font-semibold text-sm">{formatCurrency(hoveredDay.value)}</p>
            <p className="text-white/50 text-xs">{hoveredDay.date}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-white/50">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ background: ratio === 0 ? 'rgba(255, 255, 255, 0.05)' : `rgba(0, 245, 255, ${ratio})` }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING ORB BACKGROUND
// ============================================================================
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orb */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%)',
          left: '10%',
          top: '20%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary orb */}
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 160, 0.5) 0%, transparent 70%)',
          right: '15%',
          bottom: '30%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Accent orb */}
      <motion.div
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(255, 100, 150, 0.4) 0%, transparent 70%)',
          left: '50%',
          top: '60%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ============================================================================
// MAIN ANALYTICS PAGE
// ============================================================================
export function AnalyticsPage() {
  const navigate = useNavigate();
  const { expenses: storeExpenses } = useStore();

  // Use MEP demo data combined with any store expenses
  const mepData = useMemo(() => getMEPExpenseData(), []);

  // Calculate analytics data from MEP expenses
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Use MEP data for analytics
    const thisMonthExpenses = mepData.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const lastMonthExpenses = mepData.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === (thisMonth - 1 + 12) % 12 &&
             (thisMonth === 0 ? d.getFullYear() === thisYear - 1 : d.getFullYear() === thisYear);
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = 15000; // Higher budget for construction firm

    // Category breakdown from MEP data
    const categoryTotals: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryLabels: Record<string, string> = {
      tools: 'Tools & Equipment',
      materials: 'Materials',
      fuel: 'Vehicle & Fuel',
      meals: 'Job Site Meals',
      lodging: 'Travel & Lodging',
      safety: 'Safety Equipment',
      transportation: 'Transportation',
      software: 'Software & Subscriptions',
      it: 'IT & Hardware',
    };

    const categoryIcons: Record<string, string> = {
      tools: '🔧',
      materials: '📦',
      fuel: '⛽',
      meals: '🍽️',
      lodging: '🏨',
      safety: '🦺',
      transportation: '🚗',
      software: '💻',
      it: '🖥️',
    };

    const categoryData = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, value]) => ({
        label: categoryLabels[category] || getCategoryLabel(category),
        value,
        icon: categoryIcons[category] || getCategoryIcon(category),
        color: getCategoryColor(category),
      }));

    // Top merchants from MEP data
    const merchantTotals: Record<string, { amount: number; count: number }> = {};
    mepData.forEach(e => {
      if (!merchantTotals[e.merchant]) {
        merchantTotals[e.merchant] = { amount: 0, count: 0 };
      }
      merchantTotals[e.merchant].amount += e.amount;
      merchantTotals[e.merchant].count += 1;
    });

    const topMerchants = Object.entries(merchantTotals)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 4)
      .map(([name, data], index) => ({
        name,
        ...data,
        icon: getMerchantIcon(name),
        gradient: getMerchantGradient(index),
      }));

    // Monthly trend for MEP firm (realistic construction spending)
    const monthlyTrend = [
      { month: 'Jul', value: 12800, prevValue: 11200 },
      { month: 'Aug', value: 14500, prevValue: 13100 },
      { month: 'Sep', value: 11200, prevValue: 12400 },
      { month: 'Oct', value: 16500, prevValue: 14800 },
      { month: 'Nov', value: totalLastMonth || 15200, prevValue: 13500 },
      { month: 'Dec', value: totalThisMonth || 8400, prevValue: totalLastMonth || 15200 },
    ];

    // Heatmap data from MEP expenses (last 12 weeks)
    const heatmapData: { date: string; value: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayExpenses = mepData.filter(e => {
        const expDate = new Date(e.date);
        return expDate.toDateString() === date.toDateString();
      });
      const value = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      heatmapData.push({ date: dateStr, value });
    }

    // Sparkline data (last 30 days) from MEP data
    const sparklineData: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayExpenses = mepData.filter(e => {
        const expDate = new Date(e.date);
        return expDate.toDateString() === date.toDateString();
      });
      const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      sparklineData.push(dayTotal || Math.random() * 500 + 200);
    }

    const percentChange = totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100).toFixed(1)
      : '0';

    return {
      totalThisMonth,
      totalLastMonth,
      budget,
      categoryData: categoryData.length > 0 ? categoryData : getDefaultCategoryData(),
      topMerchants: topMerchants.length > 0 ? topMerchants : getDefaultMerchants(),
      monthlyTrend,
      heatmapData,
      sparklineData,
      percentChange,
      isUp: totalThisMonth >= totalLastMonth,
      projectCount: 5,
      expenseCount: thisMonthExpenses.length,
    };
  }, [mepData, storeExpenses]);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-32 md:pb-8 relative">
      <FloatingOrbs />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ================================================================ */}
        {/* HERO SECTION - Total Spending & Budget Ring */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          style={{ paddingLeft: '15px' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-accent-primary" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Spending Analytics</h1>
          </div>
          <p className="text-white/60">Your financial insights at a glance</p>
        </motion.div>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
          {/* Total Spending Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <GlassCard className="p-8 relative overflow-hidden" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
              {/* Animated background gradient */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, transparent 50%, rgba(0, 245, 160, 0.1) 100%)',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4" style={{ marginLeft: '15px', marginTop: '15px' }}>
                  <div className="p-2 rounded-xl bg-accent-primary/20">
                    <DollarSign className="w-5 h-5 text-accent-primary" />
                  </div>
                  <span className="text-white/60 text-sm font-medium">This Month</span>
                </div>

                <div className="mb-4" style={{ marginLeft: '15px' }}>
                  <h2 className="text-5xl md:text-6xl font-bold text-white mb-2">
                    <AnimatedCounter value={analytics.totalThisMonth} prefix="$" decimals={2} />
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-sm font-medium ${analytics.isUp ? 'text-red-400' : 'text-success-primary'}`}>
                      {analytics.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {analytics.percentChange}%
                    </span>
                    <span className="text-white/40 text-sm">vs last month</span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mt-6">
                  <p className="text-white/40 text-xs mb-2" style={{ marginLeft: '15px' }}>Last 30 days</p>
                  <Sparkline data={analytics.sparklineData} width={280} height={50} />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Budget Progress Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <GlassCard className="p-8 relative overflow-hidden" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <GlowingProgressRing
                  value={analytics.totalThisMonth}
                  max={analytics.budget}
                  size={180}
                  label="of budget"
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-white/60 text-sm font-medium mb-2">Monthly Budget</h3>
                  <p className="text-3xl font-bold text-white mb-4">
                    {formatCurrency(analytics.budget)}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Spent</span>
                      <span className="text-white font-medium" style={{ marginRight: '30px' }}>{formatCurrency(analytics.totalThisMonth)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Remaining</span>
                      <span className={`font-medium ${analytics.budget - analytics.totalThisMonth < 0 ? 'text-red-400' : 'text-success-primary'}`} style={{ marginRight: '30px' }}>
                        {formatCurrency(Math.max(0, analytics.budget - analytics.totalThisMonth))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ================================================================ */}
        {/* CATEGORY BREAKDOWN */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6" style={{ paddingLeft: '15px', paddingRight: '15px', marginTop: '25px' }}>
            <div>
              <h2 className="text-xl font-bold text-white">Category Breakdown</h2>
              <p className="text-white/50 text-sm mt-1">Top 6 spending categories this month</p>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-1 text-accent-primary text-sm font-medium"
              onClick={() => navigate('/categories')}
            >
              View all <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div style={{ marginLeft: '15px', marginRight: '15px' }}>
            <GlassCard className="p-8" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
              <div className="flex flex-col lg:flex-row items-center gap-8" style={{ padding: '15px' }}>
                <AnimatedDonutChart data={analytics.categoryData} size={220} />

                {/* Legend */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {analytics.categoryData.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: item.color, boxShadow: `0 0 10px ${item.color}40` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.label}</p>
                        <p className="text-white/50 text-xs">{formatCurrency(item.value)}</p>
                      </div>
                      <span className="text-lg">{item.icon}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* TOP MERCHANTS */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          style={{ marginTop: '25px' }}
        >
          <div className="flex items-center justify-between mb-6" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            <h2 className="text-xl font-bold text-white">Top Merchants</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            {analytics.topMerchants.map((merchant, index) => (
              <MerchantCard
                key={merchant.name}
                name={merchant.name}
                amount={merchant.amount}
                count={merchant.count}
                icon={merchant.icon}
                gradient={merchant.gradient}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* MONTHLY TREND CHART */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          style={{ marginTop: '25px' }}
        >
          <div className="flex items-center justify-between mb-6" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            <h2 className="text-xl font-bold text-white">Monthly Trends</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-primary" />
                <span className="text-white/60">This Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/30" style={{ border: '1px dashed rgba(255,255,255,0.5)' }} />
                <span className="text-white/60">Last Year</span>
              </div>
            </div>
          </div>

          <div style={{ marginLeft: '15px', marginRight: '15px' }}>
            <GlassCard className="p-8" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
              <div style={{ padding: '15px' }}>
                <AnimatedAreaChart data={analytics.monthlyTrend} height={250} />
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* SPENDING HEATMAP */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: '25px' }}
        >
          <div className="flex items-center justify-between mb-6" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            <h2 className="text-xl font-bold text-white">Spending Activity</h2>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/50" />
              <span className="text-white/50 text-sm">Last 12 weeks</span>
            </div>
          </div>

          <div style={{ marginLeft: '15px', marginRight: '15px' }}>
            <GlassCard className="p-8 overflow-x-auto" style={{ background: 'rgba(30, 30, 50, 0.6)' }}>
              <SpendingHeatmap data={analytics.heatmapData} />
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    transportation: '#00f5ff',
    meals: '#00f5a0',
    lodging: '#ff6b9d',
    supplies: '#ffd93d',
    entertainment: '#c084fc',
    tools: '#f97316',
    materials: '#22d3ee',
    permits: '#8b5cf6',
    safety: '#ef4444',
    fuel: '#22c55e',
    software: '#a855f7',
    it: '#ec4899',
    other: '#94a3b8',
  };
  return colors[category] || colors.other;
}

function getMerchantIcon(name: string): string {
  const icons: Record<string, string> = {
    // Construction & MEP Suppliers
    'Home Depot': '🏠',
    'Grainger': '🔧',
    'Ferguson': '🚿',
    'Graybar Electric': '⚡',
    'Fastenal': '🔩',
    'United Rentals': '🚜',
    'Sunbelt Rentals': '🏗️',
    'MSC Industrial': '⚙️',
    'Johnstone Supply': '❄️',
    'Winsupply': '🔌',
    // Gas & Fuel
    'Shell': '⛽',
    'Chevron': '⛽',
    'ExxonMobil': '⛽',
    // Hotels
    'Hampton Inn': '🏨',
    'Marriott': '🏨',
    'Holiday Inn': '🏨',
    // Food & Meetings
    'Chipotle': '🌯',
    'Panera Bread': '🥖',
    'Subway': '🥪',
    // Construction Software & IT
    'Autodesk': '📐',
    'Bluebeam': '📋',
    'Procore': '🏗️',
    'PlanGrid': '📱',
    'Microsoft 365': '💻',
    'Adobe Creative Cloud': '🎨',
    'Trimble': '📍',
    'Dell Technologies': '🖥️',
    'CDW': '💿',
    'Best Buy Business': '🖥️',
    'Apple': '🍎',
    // Other
    'Uber': '🚗',
    'Enterprise': '🚗',
    'Delta Airlines': '✈️',
    'Southwest Airlines': '✈️',
  };
  return icons[name] || '🏪';
}

function getMerchantGradient(index: number): string {
  const gradients = [
    'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', // Orange - Tools/Equipment
    'linear-gradient(135deg, #00f5ff 0%, #00ddeb 100%)', // Cyan - Electrical
    'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', // Green - Fuel
    'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', // Teal - Plumbing
    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', // Purple - HVAC
    'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', // Red - Safety
  ];
  return gradients[index % gradients.length];
}

// MEP Construction Firm Default Category Data
function getDefaultCategoryData() {
  return [
    { label: 'Materials', value: 4280, icon: '📦', color: '#06b6d4' },
    { label: 'Tools & Equipment', value: 2450, icon: '🔧', color: '#f97316' },
    { label: 'Software & Subscriptions', value: 2180, icon: '💻', color: '#3b82f6' },
    { label: 'Vehicle & Fuel', value: 1890, icon: '⛽', color: '#22c55e' },
    { label: 'IT & Hardware', value: 1650, icon: '🖥️', color: '#6366f1' },
    { label: 'Travel & Lodging', value: 1420, icon: '🏨', color: '#ff6b9d' },
  ];
}

// MEP Construction Firm Top Merchants
function getDefaultMerchants() {
  return [
    { name: 'Grainger', amount: 3245.50, count: 18, icon: '🔧', gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
    { name: 'Ferguson', amount: 2890.00, count: 12, icon: '🚿', gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' },
    { name: 'Graybar Electric', amount: 2156.99, count: 15, icon: '⚡', gradient: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)' },
    { name: 'United Rentals', amount: 1850.00, count: 4, icon: '🏗️', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
  ];
}

// Generate realistic MEP construction firm expense data
function generateMEPExpenseData() {
  const now = new Date();
  const expenses: Array<{
    date: Date;
    amount: number;
    merchant: string;
    category: string;
    project?: string;
  }> = [];

  // Projects for an MEP firm
  const projects = [
    'Downtown Office Tower - Phase 2',
    'Memorial Hospital HVAC Retrofit',
    'Riverside Apartments Complex',
    'Tech Campus Data Center',
    'City Hall Renovation',
  ];

  // Typical MEP expenses
  const expenseTypes = [
    // Tools & Equipment
    { merchant: 'Grainger', category: 'tools', minAmount: 150, maxAmount: 800 },
    { merchant: 'Home Depot', category: 'tools', minAmount: 50, maxAmount: 400 },
    { merchant: 'Fastenal', category: 'tools', minAmount: 75, maxAmount: 350 },
    { merchant: 'MSC Industrial', category: 'tools', minAmount: 100, maxAmount: 500 },
    // Plumbing Materials
    { merchant: 'Ferguson', category: 'materials', minAmount: 200, maxAmount: 1200 },
    { merchant: 'Winsupply', category: 'materials', minAmount: 150, maxAmount: 800 },
    // Electrical Materials
    { merchant: 'Graybar Electric', category: 'materials', minAmount: 180, maxAmount: 950 },
    // HVAC
    { merchant: 'Johnstone Supply', category: 'materials', minAmount: 200, maxAmount: 1100 },
    // Equipment Rental
    { merchant: 'United Rentals', category: 'tools', minAmount: 400, maxAmount: 1500 },
    { merchant: 'Sunbelt Rentals', category: 'tools', minAmount: 350, maxAmount: 1200 },
    // Fuel
    { merchant: 'Shell', category: 'fuel', minAmount: 60, maxAmount: 150 },
    { merchant: 'Chevron', category: 'fuel', minAmount: 55, maxAmount: 140 },
    // Meals
    { merchant: 'Chipotle', category: 'meals', minAmount: 12, maxAmount: 85 },
    { merchant: 'Panera Bread', category: 'meals', minAmount: 15, maxAmount: 95 },
    { merchant: 'Subway', category: 'meals', minAmount: 10, maxAmount: 65 },
    // Travel
    { merchant: 'Hampton Inn', category: 'lodging', minAmount: 120, maxAmount: 180 },
    { merchant: 'Enterprise', category: 'transportation', minAmount: 80, maxAmount: 200 },
    // Safety
    { merchant: 'Grainger', category: 'safety', minAmount: 50, maxAmount: 300 },
    // Construction Software Subscriptions
    { merchant: 'Autodesk', category: 'software', minAmount: 250, maxAmount: 2500 }, // Revit, AutoCAD, BIM 360
    { merchant: 'Bluebeam', category: 'software', minAmount: 150, maxAmount: 400 }, // PDF markup for construction
    { merchant: 'Procore', category: 'software', minAmount: 500, maxAmount: 1500 }, // Project management
    { merchant: 'PlanGrid', category: 'software', minAmount: 100, maxAmount: 300 }, // Blueprint management
    { merchant: 'Trimble', category: 'software', minAmount: 200, maxAmount: 800 }, // SketchUp, MEP modeling
    // General IT & Office Software
    { merchant: 'Microsoft 365', category: 'software', minAmount: 12, maxAmount: 300 }, // Office subscriptions
    { merchant: 'Adobe Creative Cloud', category: 'software', minAmount: 55, maxAmount: 600 },
    // IT Hardware
    { merchant: 'Dell Technologies', category: 'it', minAmount: 800, maxAmount: 3500 }, // Laptops, workstations
    { merchant: 'CDW', category: 'it', minAmount: 150, maxAmount: 2000 }, // IT supplies & hardware
    { merchant: 'Best Buy Business', category: 'it', minAmount: 100, maxAmount: 1500 }, // Electronics
    { merchant: 'Apple', category: 'it', minAmount: 300, maxAmount: 2000 }, // iPads for field work
  ];

  // Generate 90 days of expenses
  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip some weekends (lower activity)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || (dayOfWeek === 6 && Math.random() > 0.3)) continue;

    // 2-5 expenses per working day
    const numExpenses = Math.floor(Math.random() * 4) + 2;

    for (let j = 0; j < numExpenses; j++) {
      const expenseType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
      const amount = Math.round(
        (expenseType.minAmount + Math.random() * (expenseType.maxAmount - expenseType.minAmount)) * 100
      ) / 100;

      expenses.push({
        date,
        amount,
        merchant: expenseType.merchant,
        category: expenseType.category,
        project: projects[Math.floor(Math.random() * projects.length)],
      });
    }
  }

  return expenses;
}

// Cache the generated data
let cachedMEPData: ReturnType<typeof generateMEPExpenseData> | null = null;
function getMEPExpenseData() {
  if (!cachedMEPData) {
    cachedMEPData = generateMEPExpenseData();
  }
  return cachedMEPData;
}
