import { useActions } from 'koota/react'
import { actions } from '@/koota/actions'

export function MoveRobotButton() {
  const { moveRobotRight } = useActions(actions)
  return <button onClick={moveRobotRight}>Step →</button>
}
