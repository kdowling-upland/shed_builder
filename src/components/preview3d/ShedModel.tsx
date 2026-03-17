import { useShedStore } from '../../store/useShedStore.ts';
import { FloorModel } from './FloorModel.tsx';
import { WallModel } from './WallModel.tsx';
import { RoofModel } from './RoofModel.tsx';
import { RafterFramingModel } from './RafterFramingModel.tsx';
import { OpeningModel } from './OpeningModel.tsx';
import { FramingModel } from './FramingModel.tsx';
import type { WallId } from '../../types/shed.ts';

export function ShedModel() {
  const design = useShedStore((s) => s.design);
  const { width, length, wallHeight, roof, openings, siding, framing } = design;

  const walls: WallId[] = ['front', 'back', 'left', 'right'];

  return (
    <group position={[-width / 2, 0, -length / 2]}>
      <FloorModel width={width} length={length} />

      {walls.map((wall) => (
        <group key={wall}>
          <WallModel
            wall={wall}
            widthFt={width}
            lengthFt={length}
            heightFt={wallHeight}
            openings={openings}
            roof={roof}
            siding={siding}
          />
          <FramingModel
            wall={wall}
            widthFt={width}
            lengthFt={length}
            heightFt={wallHeight}
            openings={openings}
            framing={framing}
          />
        </group>
      ))}

      <RafterFramingModel
        widthFt={width}
        lengthFt={length}
        wallHeight={wallHeight}
        roof={roof}
        framing={framing}
      />
      <RoofModel
        widthFt={width}
        lengthFt={length}
        wallHeight={wallHeight}
        roof={roof}
      />

      {openings.map((opening) => (
        <OpeningModel
          key={opening.id}
          opening={opening}
          shedWidth={width}
          shedLength={length}
          wallHeight={wallHeight}
        />
      ))}
    </group>
  );
}
