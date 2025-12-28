'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function RotatingCube() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function TestCube() {
  return (
    <div className="w-full h-64 bg-gray-100 rounded-lg">
      <Canvas camera={{ position: [3, 3, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <RotatingCube />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}