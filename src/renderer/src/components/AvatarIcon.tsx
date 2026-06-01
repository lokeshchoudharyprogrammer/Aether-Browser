import React from 'react'
import * as Icons from 'lucide-react'

interface AvatarIconProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ name, size = 24, className, style }) => {
  // Resolve Lucide icon component dynamically from string name
  const IconComponent = (Icons as any)[name]

  if (!IconComponent) {
    // Fallback to default User icon if name doesn't match
    return <Icons.User size={size} className={className} style={style} />
  }

  return <IconComponent size={size} className={className} style={style} />
}
