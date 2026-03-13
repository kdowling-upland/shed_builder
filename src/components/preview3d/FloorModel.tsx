import { useMemo } from 'react';
import { getFloorTexture } from '../../engine/geometry/textures.ts';

interface FloorModelProps {
  width: number;
  length: number;
}

export function FloorModel({ width, length }: FloorModelProps) {
  const thickness = 0.05;
  const texture = useMemo(() => getFloorTexture(), []);

  return (
    <mesh position={[width / 2, -thickness / 2, length / 2]}>
      <boxGeometry args={[width, thickness, length]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}
