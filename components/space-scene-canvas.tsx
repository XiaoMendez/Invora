"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Stars, Float, Environment } from "@react-three/drei"
import * as THREE from "three"

function Planet({
  position = [0, 0, 0] as [number, number, number],
  size = 1,
  color = "#a855f7",
  emissiveIntensity = 0.3,
  speed = 0.3,
}: {
  position?: [number, number, number]
  size?: number
  color?: string
  emissiveIntensity?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * speed
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.5, 64]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  )
}

function EarthPlanet({
  position = [0, 0, 0] as [number, number, number],
  size = 1,
}: {
  position?: [number, number, number]
  size?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const earthTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load("/assets/3d/texture_earth.jpg")
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15
  })

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={position}>
        <sphereGeometry args={[size * 1.02, 64, 64]} />
        <meshStandardMaterial color="#4da6ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </Float>
  )
}

function Rocket({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: {
  position?: [number, number, number]
  scale?: number
}) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
  })

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0, 0, Math.PI / 12]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 1, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.15, 0.4, 16]} />
        <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 0.16]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.5} />
      </mesh>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.sin(angle) * 0.2, -0.4, Math.cos(angle) * 0.2]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.02, 0.3, 0.15]} />
          <meshStandardMaterial color="#a855f7" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, -0.6, 0]}>
        <coneGeometry args={[0.12, 0.3, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, -0.7, 0]} color="#f97316" intensity={2} distance={3} />
    </group>
  )
}

function OrbitingParticles({
  count = 100,
  radius = 5,
  color = "#a855f7",
}: {
  count?: number
  radius?: number
  color?: string
}) {
  const pointsRef = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * 2
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2
      pos[i * 3 + 2] = Math.sin(angle) * r
    }
    return pos
  }, [count, radius])

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export function SpaceSceneCanvas({ variant = "hero" }: { variant?: "hero" | "dashboard" | "minimal" }) {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, variant === "hero" ? 8 : 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <directionalLight position={[10, 5, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[-5, 3, -5]} intensity={0.4} color="#a855f7" />

        <Stars radius={50} depth={60} count={variant === "hero" ? 3000 : 1500} factor={4} saturation={0} fade speed={0.5} />

        {variant === "hero" && (
          <>
            <EarthPlanet position={[3.5, -1, -3]} size={1.2} />
            <Planet position={[-4, 2, -5]} size={0.6} color="#a855f7" emissiveIntensity={0.5} />
            <Planet position={[5, 3, -8]} size={0.4} color="#f472b6" emissiveIntensity={0.3} />
            <Rocket position={[-2, 0.5, -1]} scale={0.8} />
            <OrbitingParticles count={150} radius={6} color="#a855f7" />
          </>
        )}

        {variant === "dashboard" && (
          <>
            <Planet position={[8, -3, -10]} size={1.5} color="#a855f7" emissiveIntensity={0.2} speed={0.1} />
            <OrbitingParticles count={80} radius={10} color="#a855f7" />
          </>
        )}

        {variant === "minimal" && (
          <Planet position={[6, -2, -8]} size={0.8} color="#a855f7" emissiveIntensity={0.2} speed={0.1} />
        )}

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}

export function StarsBackgroundCanvas() {
  return (
    <div className="fixed inset-0 -z-20">
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={0.3} />
        <ambientLight intensity={0.05} />
      </Canvas>
    </div>
  )
}
