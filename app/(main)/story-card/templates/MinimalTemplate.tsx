import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'
import { Avatar } from '../components/Avatar'

export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatScore, formatDate }, ref) => {
    const isDoubles = match.match_type === 'doubles'

    return (
      <div
        ref={ref}
        data-card
        className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {hasCustomBg ? (
          <>
            <img
              src={backgroundImage!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/90"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100"></div>
        )}

        <div className="h-full flex flex-col relative z-10 p-8">
          {/* Top Section */}
          <div className="text-center">
            <div className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-1">
              {isDoubles ? 'Doubles' : 'Singles'}
            </div>
            <div className="text-gray-400 text-[10px]">
              {formatDate(match.played_at)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center text-center">
            {/* Result */}
            <div className={`text-sm font-medium uppercase tracking-widest mb-4 ${
              match.result === 'win' ? 'text-yellow-600' : 'text-gray-400'
            }`}>
              {match.result === 'win' ? 'Victory' : match.result === 'loss' ? 'Defeat' : 'Draw'}
            </div>

            {/* Score - Large Typography */}
            <div className="text-gray-800 text-6xl font-light tracking-tight mb-6">
              {formatScore()}
            </div>

            {/* Players */}
            <div className="space-y-3">
              {/* Player */}
              <div className="flex items-center justify-center gap-3">
                {isDoubles ? (
                  <div className="flex -space-x-2">
                    <Avatar src={profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400 ring-2 ring-white" />
                    <Avatar src={match.partner_profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400 ring-2 ring-white" />
                  </div>
                ) : (
                  <Avatar src={profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400" />
                )}
                {isDoubles ? (
                  <div className="text-left">
                    <div className="text-gray-700 font-medium text-sm">{displayName}</div>
                    <div className="text-gray-700 font-medium text-sm">
                      {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-700 font-medium text-sm">{displayName}</span>
                )}
              </div>

              <div className="text-gray-500 text-xs font-medium">vs</div>

              {/* Opponent */}
              <div className="flex items-center justify-center gap-3">
                {isDoubles ? (
                  <div className="flex -space-x-2">
                    <Avatar src={match.opponent_profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400 ring-2 ring-white" />
                    <Avatar src={match.opponent_partner_profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400 ring-2 ring-white" />
                  </div>
                ) : (
                  <Avatar src={match.opponent_profile?.avatar_url} size="sm" className="bg-gray-200 text-gray-400" />
                )}
                {isDoubles ? (
                  <div className="text-left">
                    <div className="text-gray-500 font-medium text-sm">
                      {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                    </div>
                    <div className="text-gray-500 font-medium text-sm">
                      {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 font-medium text-sm">
                    {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center">
            {match.location && (
              <div className="text-gray-500 text-xs mb-2">{match.location}</div>
            )}
            <div className="w-8 h-px bg-gray-300 mx-auto mb-3"></div>
            <div className="text-gray-400 text-[10px] font-outfit font-semibold tracking-widest">MATCHPOST</div>
          </div>
        </div>
      </div>
    )
  }
)

MinimalTemplate.displayName = 'MinimalTemplate'
