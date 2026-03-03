"use client"

import dynamic from "next/dynamic"

const SpaceSceneCanvas = dynamic(
  () => import("@/components/space-scene-canvas").then((mod) => mod.SpaceSceneCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 -z-10 bg-background" /> }
)

const StarsBackgroundCanvas = dynamic(
  () => import("@/components/space-scene-canvas").then((mod) => mod.StarsBackgroundCanvas),
  { ssr: false, loading: () => <div className="fixed inset-0 -z-20 bg-background" /> }
)

export function SpaceScene({ variant = "hero" }: { variant?: "hero" | "dashboard" | "minimal" }) {
  return <SpaceSceneCanvas variant={variant} />
}

export function StarsBackground() {
  return <StarsBackgroundCanvas />
}
