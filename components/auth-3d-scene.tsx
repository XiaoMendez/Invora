"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, Float, Environment } from "@react-three/drei"
import * as THREE from "three"

function Crystal({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number]
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += 0.005
    meshRef.current.rotation.y += 0.008
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
  })

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {/* Main crystal body */}
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#7c3aed"
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Crystal glow */}
      <mesh position={position} scale={scale * 1.15}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#a855f7"
          transparent
          opacity={0.2}
          emissive="#a855f7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Inner light */}
      <pointLight position={position} color="#a855f7" intensity={2} distance={2} />
    </Float>
  )
}

function FloatingCube({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#60a5fa",
}: {
  position?: [number, number, number]
  scale?: number
  color?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += 0.003
    meshRef.current.rotation.y += 0.005
  })

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Cube glow */}
      <mesh position={position} scale={scale * 1.2}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      <pointLight position={position} color={color} intensity={1.5} distance={1.5} />
    </Float>
  )
}

function OrbitingParticles({
  count = 80,
  radius = 4,
}: {
  count?: number
  radius?: number
}) {
  const pointsRef = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * 1
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [count, radius])

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.08
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#a855f7" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

export function Auth3DScene({ variant = "login" }: { variant?: "login" | "register" }) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 5, 5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-5, 3, -5]} intensity={0.4} color="#a855f7" />

        <Stars radius={50} depth={60} count={2000} factor={4} saturation={0} fade speed={0.3} />

        {variant === "login" ? (
          <>
            <Crystal position={[0, 0, -2]} scale={1.2} />
            <FloatingCube position={[-4, 2, -3]} scale={0.7} color="#60a5fa" />
            <FloatingCube position={[4, -1, -3]} scale={0.6} color="#ec4899" />
            <OrbitingParticles count={100} radius={5} />
          </>
        ) : (
          <>
            <Crystal position={[0, 0.5, -2]} scale={1} />
            <FloatingCube position={[-3.5, -1.5, -3]} scale={0.8} color="#10b981" />
            <FloatingCube position={[3.5, 1, -3]} scale={0.7} color="#f59e0b" />
            <FloatingCube position={[0, -3, -2]} scale={0.5} color="#60a5fa" />
            <OrbitingParticles count={120} radius={4.5} />
          </>
        )}

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
