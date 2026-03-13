import { Rect, Group, Text } from 'react-konva';
import type { Opening, WallId } from '../../types/shed.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import { useShedStore } from '../../store/useShedStore.ts';

interface OpeningItemProps {
  opening: Opening;
  scale: number;
  shedWidth: number;
  shedLength: number;
  originX: number;
  originY: number;
}

function getOpeningRect(
  opening: Opening,
  scale: number,
  shedWidth: number,
  shedLength: number,
  originX: number,
  originY: number,
) {
  const pos = (opening.position / 12) * scale;
  const w = (opening.width / 12) * scale;
  const wallThickness = 6; // pixels
  const depth = opening.type.includes('door') ? wallThickness + 4 : wallThickness;

  const wallWidthPx = shedWidth * scale;
  const wallLengthPx = shedLength * scale;

  switch (opening.wall) {
    case 'front':
      return { x: originX + pos, y: originY - depth / 2, width: w, height: depth };
    case 'back':
      return { x: originX + pos, y: originY + wallLengthPx - depth / 2, width: w, height: depth };
    case 'left':
      return { x: originX - depth / 2, y: originY + pos, width: depth, height: w };
    case 'right':
      return { x: originX + wallWidthPx - depth / 2, y: originY + pos, width: depth, height: w };
  }
}

function getDragBounds(
  wall: WallId,
  shedWidth: number,
  shedLength: number,
  scale: number,
  openingWidth: number,
  originX: number,
  originY: number,
) {
  const wallLen = (wall === 'front' || wall === 'back' ? shedWidth : shedLength) * scale;
  const openingW = (openingWidth / 12) * scale;

  switch (wall) {
    case 'front':
    case 'back': {
      const y = wall === 'front' ? originY - 5 : originY + shedLength * scale - 5;
      return { minX: originX, maxX: originX + wallLen - openingW, fixedY: y };
    }
    case 'left':
    case 'right': {
      const x = wall === 'left' ? originX - 5 : originX + shedWidth * scale - 5;
      return { minY: originY, maxY: originY + wallLen - openingW, fixedX: x };
    }
  }
}

export function OpeningItem({ opening, scale, shedWidth, shedLength, originX, originY }: OpeningItemProps) {
  const selectedId = useUIStore((s) => s.selectedOpeningId);
  const setSelectedId = useUIStore((s) => s.setSelectedOpeningId);
  const moveOpening = useShedStore((s) => s.moveOpening);

  const rect = getOpeningRect(opening, scale, shedWidth, shedLength, originX, originY);
  const isSelected = selectedId === opening.id;
  const isDoor = opening.type.includes('door');
  const color = isDoor ? '#a07830' : '#4a7fad';
  const selectedColor = '#d4a254';

  const bounds = getDragBounds(opening.wall, shedWidth, shedLength, scale, opening.width, originX, originY);

  const isHorizontal = opening.wall === 'front' || opening.wall === 'back';

  const handleDragEnd = (e: { target: { x: () => number; y: () => number } }) => {
    const x = e.target.x();
    const y = e.target.y();

    let newPos: number;
    if (isHorizontal) {
      newPos = ((x - originX) / scale) * 12;
    } else {
      newPos = ((y - originY) / scale) * 12;
    }
    newPos = Math.max(0, Math.round(newPos));
    moveOpening(opening.id, opening.wall, newPos);
  };

  const label = opening.type === 'window' ? 'W' :
    opening.type === 'single-door' ? 'D' :
    opening.type === 'double-door' ? 'DD' : 'LD';

  return (
    <Group
      x={rect.x}
      y={rect.y}
      draggable
      onDragEnd={handleDragEnd}
      dragBoundFunc={(pos) => {
        if (isHorizontal) {
          return {
            x: Math.min(Math.max(pos.x, bounds.minX!), bounds.maxX!),
            y: bounds.fixedY!,
          };
        } else {
          return {
            x: bounds.fixedX!,
            y: Math.min(Math.max(pos.y, bounds.minY!), bounds.maxY!),
          };
        }
      }}
      onClick={() => setSelectedId(opening.id)}
    >
      <Rect
        width={rect.width}
        height={rect.height}
        fill={isSelected ? selectedColor : color}
        stroke={isSelected ? selectedColor : '#2a2f3a'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={2}
        opacity={isSelected ? 1 : 0.85}
      />
      <Text
        x={0}
        y={0}
        width={rect.width}
        height={rect.height}
        text={label}
        fontSize={10}
        fill={isSelected ? '#0c0e12' : 'white'}
        fontFamily="DM Sans"
        fontStyle="700"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
