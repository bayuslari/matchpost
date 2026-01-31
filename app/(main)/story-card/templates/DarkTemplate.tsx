import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'

export const DarkTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatScore, formatShortDate }, ref) => {
    const isDoubles = match.match_type === 'doubles'

    return (
      <div
        ref={ref}
        data-card
        className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <img
          src={hasCustomBg ? backgroundImage! : '/roger.jpeg'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>

        <div className="h-full flex flex-col relative z-10 p-6">
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center text-center">
            {/* Result */}
            <div className={`text-5xl font-black mb-1 ${
              match.result === 'win' ? 'text-yellow-400' : 'text-white'
            }`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
            </div>

            {/* Score */}
            <div className="text-white text-xl font-bold tracking-wider mb-4">
              {formatScore()}
            </div>

            {/* Players - simplified */}
            <div className="space-y-1.5">
              <div className="text-white/90 text-xs font-medium">
                {isDoubles ? (
                  <>{displayName} & {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}</>
                ) : (
                  displayName
                )}
              </div>

              <div className="text-yellow-400/80 text-[10px] font-bold">VS</div>

              <div className="text-white/70 text-xs">
                {isDoubles ? (
                  <>{formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)} & {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}</>
                ) : (
                  formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-8 text-center space-y-1">
            <div className="text-white/40 text-[10px]">{match.location || 'Tennis Court'} • {formatShortDate(match.played_at)}</div>
            <div className="text-white/40 text-[9px] font-semibold tracking-widest">matchpost.app</div>
          </div>
        </div>
      </div>
    )
  }
)

DarkTemplate.displayName = 'DarkTemplate'
