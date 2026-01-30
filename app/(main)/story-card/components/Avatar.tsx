interface AvatarProps {
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ src, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}
      <svg className={`${iconSizes[size]} text-current ${src ? 'hidden' : ''}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  )
}
