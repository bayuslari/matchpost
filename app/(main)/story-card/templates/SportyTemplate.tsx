import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'
import { Avatar } from '../components/Avatar'

export const SportyTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatScore, formatShortDate, sortedSets }, ref) => {
    const isDoubles = match.match_type === 'doubles'
    const playerSetsWon = sortedSets.filter(s => s.player_score > s.opponent_score).length
    const opponentSetsWon = sortedSets.filter(s => s.opponent_score > s.player_score).length

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
            <div className="absolute inset-0 bg-gradient-to-b from-orange-600/90 via-red-500/80 to-red-700/95"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500 via-red-500 to-red-700"></div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"></div>

        <div className="h-full flex flex-col relative z-10 p-5">
          {/* Header */}
          <div className="text-center">
            <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
              {isDoubles ? 'Doubles Match' : 'Singles Match'}
            </div>
          </div>

          {/* Result & Score */}
          <div className="flex-1 flex flex-col justify-center items-center">
            {/* Big Result */}
            <div className={`text-6xl font-black mb-1 ${
              match.result === 'win' ? 'text-yellow-300' : 'text-white'
            }`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
            </div>

            {/* Score */}
            <div className="text-white text-2xl font-bold tracking-wide mb-6">
              {formatScore()}
            </div>

            {/* Players Section */}
            <div className="w-full space-y-3">
              {/* Player Card */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-3">
                  {isDoubles ? (
                    <div className="flex -space-x-2 flex-shrink-0">
                      <Avatar src={profile?.avatar_url} size="md" className="bg-white/20 text-white/70 ring-2 ring-white/30" />
                      <Avatar src={match.partner_profile?.avatar_url} size="md" className="bg-white/20 text-white/70 ring-2 ring-white/30" />
                    </div>
                  ) : (
                    <Avatar src={profile?.avatar_url} size="md" className="bg-white/20 text-white/70" />
                  )}
                  <div className="flex-1 min-w-0">
                    {isDoubles ? (
                      <>
                        <div className="text-white font-bold text-sm truncate">{displayName}</div>
                        <div className="text-white font-bold text-sm truncate">
                          {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}
                        </div>
                      </>
                    ) : (
                      <div className="text-white font-bold text-sm truncate">{displayName}</div>
                    )}
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="text-white text-xl font-black">{playerSetsWon}</span>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                <span className="text-yellow-300 font-black text-sm px-2">VS</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>

              {/* Opponent Card */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-3">
                  {isDoubles ? (
                    <div className="flex -space-x-2 flex-shrink-0">
                      <Avatar src={match.opponent_profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-white/20" />
                      <Avatar src={match.opponent_partner_profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-white/20" />
                    </div>
                  ) : (
                    <Avatar src={match.opponent_profile?.avatar_url} size="md" className="bg-white/10 text-white/50" />
                  )}
                  <div className="flex-1 min-w-0">
                    {isDoubles ? (
                      <>
                        <div className="text-white/90 font-bold text-sm truncate">
                          {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                        </div>
                        <div className="text-white/90 font-bold text-sm truncate">
                          {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}
                        </div>
                      </>
                    ) : (
                      <div className="text-white/90 font-bold text-sm truncate">
                        {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                      </div>
                    )}
                  </div>
                  <div className="bg-black/20 rounded-lg px-3 py-1">
                    <span className="text-white/80 text-xl font-black">{opponentSetsWon}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 pt-2">
            <div className="text-white/60 text-xs">{match.location || 'Tennis Court'} • {formatShortDate(match.played_at)}</div>
            <div className="text-white/40 text-[10px] font-outfit font-semibold tracking-widest">MATCHPOST</div>
          </div>
        </div>
      </div>
    )
  }
)

SportyTemplate.displayName = 'SportyTemplate'
