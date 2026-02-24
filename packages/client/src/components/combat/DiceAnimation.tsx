import { motion } from 'framer-motion';

interface DiceAnimationProps {
  rolling: boolean;
  value: number;
}

const dotPositions: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export default function DiceAnimation({ rolling, value }: DiceAnimationProps) {
  const dots = value > 0 ? dotPositions[value] || [] : [];

  return (
    <motion.div
      className="dice-container"
      animate={rolling ? {
        rotateX: [0, 720],
        rotateY: [0, 720],
        rotateZ: [0, 360],
      } : {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div
        className="w-20 h-20 rounded-xl shadow-lg relative"
        style={{
          background: 'linear-gradient(135deg, #f5e6c8, #edd4a0)',
          border: '3px solid #946b24',
        }}
      >
        {value > 0 && !rolling && (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {dots.map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="10"
                fill="#2d2009"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              />
            ))}
          </svg>
        )}
        {rolling && (
          <div className="w-full h-full flex items-center justify-center">
            <motion.span
              className="text-3xl font-medieval text-parchment-700"
              animate={{ opacity: [1, 0, 1], scale: [1, 0.5, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              ?
            </motion.span>
          </div>
        )}
        {!rolling && value === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl text-parchment-400">-</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
