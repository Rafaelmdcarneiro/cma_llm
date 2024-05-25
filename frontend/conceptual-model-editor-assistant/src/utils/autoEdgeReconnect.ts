import { Node, Position, internalsSymbol } from "reactflow"


// Inspired by code from Adam Polický
// This logic automatically reconnects all edges to their closest node handles to make the edge end marker better visible
// https://github.com/mff-uk/dataspecer/blob/dd97ac02b12dd993e6fe3b54ecc51f9cef475742/applications/conceptual-model-editor/src/app/core-v2/reactflow/utils.ts


function getNewEdgePosition(nodeA: Node, nodeB: Node, isTarget: boolean)
{
  const centerA = getNodeCenter(nodeA)
  const centerB = getNodeCenter(nodeB)

  let position

  if (isTarget)
  {
    position = centerA.x > centerB.x ? Position.Left : Position.Right
  }
  else
  {
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom
  }

  const { x, y } = getHandleCoordsByPosition(nodeA, position, isTarget)
  return { x, y, position }
}


const getHandleCoordsByPosition = (node: Node, handlePosition: Position, isTarget: boolean) =>
{
  const handle = isTarget
      ? node[internalsSymbol]?.handleBounds?.target?.find((h) => h.position === handlePosition)
      : node[internalsSymbol]?.handleBounds?.source?.find((h) => h.position === handlePosition)

  const DEFAULT_COORDS = { x: 0, y: 0 }

  if (!handle || !handle.width || !handle.height)
  {
    return DEFAULT_COORDS
  }

  let offsetX = handle.width / 2
  let offsetY = handle.height / 2

  // Calculate offset
  switch (handlePosition)
  {
    case Position.Left:
        offsetX = 0
        break
    case Position.Right:
        offsetX = handle.width
        break
    case Position.Top:
        offsetY = 0
        break
    case Position.Bottom:
        offsetY = handle.height
        break
  }

  if (!node.positionAbsolute) return DEFAULT_COORDS

  const x = node.positionAbsolute.x + handle.x + offsetX
  const y = node.positionAbsolute.y + handle.y + offsetY

  return { x, y }
}


const getNodeCenter = (node: Node) =>
{
  if (!node || !node.positionAbsolute || !node.width || !node.height)
  {
    return { x: 0, y: 0 }
  }

  return { x: node.positionAbsolute.x + node?.width / 2, y: node.positionAbsolute.y + node.height / 2 }
}


export const calculateNewEdgeSourceAndTargetPosition = (source: Node, target: Node) =>
{
  const { x: sx, y: sy, position: sourcePos } = getNewEdgePosition(source, target, false)
  const { x: tx, y: ty, position: targetPos } = getNewEdgePosition(target, source, true)

  return { sx, sy, tx, ty, sourcePos, targetPos }
}