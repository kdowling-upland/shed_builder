import { Group, Line, Text } from 'react-konva';

interface DimensionLabelProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
}

const DIM_LINE_COLOR = '#3a4050';
const DIM_TEXT_COLOR = '#8a9ab0';

export function DimensionLabel({ x1, y1, x2, y2, label, offset = 20 }: DimensionLabelProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Normal direction for offset
  const nx = -dy / len;
  const ny = dx / len;

  const ox1 = x1 + nx * offset;
  const oy1 = y1 + ny * offset;
  const ox2 = x2 + nx * offset;
  const oy2 = y2 + ny * offset;

  const midX = (ox1 + ox2) / 2;
  const midY = (oy1 + oy2) / 2;

  return (
    <Group>
      {/* Dimension line */}
      <Line points={[ox1, oy1, ox2, oy2]} stroke={DIM_LINE_COLOR} strokeWidth={1} />
      {/* End ticks */}
      <Line points={[x1, y1, ox1, oy1]} stroke={DIM_LINE_COLOR} strokeWidth={1} dash={[2, 3]} />
      <Line points={[x2, y2, ox2, oy2]} stroke={DIM_LINE_COLOR} strokeWidth={1} dash={[2, 3]} />
      {/* Label */}
      <Text
        x={midX - 20}
        y={midY - 8}
        text={label}
        fontSize={12}
        fill={DIM_TEXT_COLOR}
        fontFamily="DM Sans"
        fontStyle="600"
        width={40}
        align="center"
      />
    </Group>
  );
}
