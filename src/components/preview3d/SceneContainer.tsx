import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { ShedModel } from './ShedModel.tsx';
import { useShedStore } from '../../store/useShedStore.ts';
import { useUIStore } from '../../store/useUIStore.ts';
import { useCallback } from 'react';

export function SceneContainer() {
  const design = useShedStore((s) => s.design);
  const setCanvasRef = useUIStore((s) => s.setCanvasRef);
  const maxDim = Math.max(design.width, design.length, design.wallHeight);
  const cameraDistance = maxDim * 1.8;

  const onCreated = useCallback((state: { gl: { domElement: HTMLCanvasElement } }) => {
    setCanvasRef(state.gl.domElement);
  }, [setCanvasRef]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance * 0.7, cameraDistance],
          fov: 45,
          near: 0.1,
          far: 500,
        }}
        gl={{ preserveDrawingBuffer: true }}
        shadows
        onCreated={onCreated}
      >
        <Environment preset="sunset" />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.8}
          castShadow
        />

        <ShedModel />

        <Grid
          args={[100, 100]}
          position={[0, -0.01, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#444"
          sectionSize={4}
          sectionThickness={1}
          sectionColor="#666"
          fadeDistance={50}
          infiniteGrid
        />

        <OrbitControls
          makeDefault
          enablePan
          minDistance={5}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
          screenSpacePanning
        />
      </Canvas>
    </div>
  );
}
