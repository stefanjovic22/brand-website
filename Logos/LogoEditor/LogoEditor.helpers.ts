export function getSides (axis){
  const firstSide = axis === 'y' ? 'top' : 'left'
  const oppositeSide = getOppositeSide(firstSide)
  return [ firstSide, oppositeSide ]
}

export function getOppositeSide (side){
  switch (side) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
    default:
      return null
  }
}

export function getAxis (side){
  switch (side) {
    case 'top':
      return 'y'
    case 'bottom':
      return 'y'
    case 'left':
      return 'x'
    case 'right':
      return 'x'
    default:
      return null
  }
}
