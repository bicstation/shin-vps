import {
  ICON_MAP,
} from './icon-map'

import {
  COLOR_MAP,
} from './color-map'

type Props = {

  icon?: string

  color?: string

  size?: number

  className?: string

}

export default function SemanticIcon({

  icon,

  color,

  size = 18,

  className,

}: Props) {

  const Icon =

    icon

      ? ICON_MAP[icon]

      : null

  const iconColor =

    color

      ? COLOR_MAP[color]

      : null

  if (!Icon) {

    return null

  }

  return (

    <Icon
      size={size}

      color={
        iconColor
        || '#94a3b8'
      }

      className={className}
    />

  )

}