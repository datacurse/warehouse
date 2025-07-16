"use client"

import { Position, Velocity } from "@/koota/traits"
import { useQuery, useTrait } from "koota/react"

export function RobotRenderer() {
  // Reactively update whenever the query updates with new entities
  const robots = useQuery(Position, Velocity)
  console.log(robots[0])
  const position = useTrait(robots[0], Position)
  return (
    <>

    </>
  )
}