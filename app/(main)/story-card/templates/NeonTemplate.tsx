import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'
import { Avatar } from '../components/Avatar'

export const NeonTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatScore, formatShortDate, sortedSets }, ref) => {
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
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 via-pink-900/60 to-cyan-900/80"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900"></div>
        )}

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}></div>

        <div className="h-full flex flex-col relative z-10 p-5">
          {/* Glowing Header */}
          <div className="text-center mb-4">
            <div className="text-cyan-400 text-[10px] font-mono uppercase tracking-[0.3em] mb-1"
              style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
              {'// '}{isDoubles ? 'Doubles' : 'Singles'} Match Complete
            </div>
            <div className={`text-3xl font-black uppercase ${
              match.result === 'win'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400'
                : 'text-white/80'
            }`}
              style={{ textShadow: match.result === 'win' ? '0 0 30px rgba(236,72,153,0.5)' : 'none' }}>
              {match.result === 'win' ? 'Victory!' : match.result === 'loss' ? 'Defeat' : 'Draw'}
            </div>
          </div>

          {/* Score Display - HUD Style */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Player HUD */}
            <div className="relative mb-4">
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-transparent rounded-full"
                style={{ boxShadow: '0 0 10px rgba(34,211,238,0.5)' }}></div>
              <div className="bg-black/40 backdrop-blur border border-cyan-400/30 rounded-lg p-3 ml-2">
                <div className="flex items-center gap-3">
                  {isDoubles ? (
                    <div className="flex -space-x-2 flex-shrink-0">
                      <Avatar src={profile?.avatar_url} size="md" className="bg-gradient-to-br from-cyan-400/20 to-pink-400/20 text-cyan-400 ring-2 ring-cyan-400/30" />
                      <Avatar src={match.partner_profile?.avatar_url} size="md" className="bg-gradient-to-br from-cyan-400/20 to-pink-400/20 text-cyan-400 ring-2 ring-cyan-400/30" />
                    </div>
                  ) : (
                    <Avatar src={profile?.avatar_url} size="lg" className="bg-gradient-to-br from-cyan-400/20 to-pink-400/20 text-cyan-400 rounded-lg border border-cyan-400/30" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-cyan-400 text-xs font-mono uppercase">{isDoubles ? 'Team 1' : 'Player 1'}</div>
                    {isDoubles ? (
                      <div className="space-y-0.5">
                        <div className="text-white font-bold truncate text-sm">{displayName}</div>
                        <div className="text-white font-bold truncate text-sm">
                          {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-white font-bold truncate text-sm">{displayName}</div>
                    )}
                  </div>
                  <div className="text-cyan-400 text-2xl font-mono font-bold"
                    style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
                    {sortedSets.filter(s => s.player_score > s.opponent_score).length}
                  </div>
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-3 my-2 px-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
              <div className="text-pink-400 font-mono text-xs px-2"
                style={{ textShadow: '0 0 10px rgba(236,72,153,0.5)' }}>VS</div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
            </div>

            {/* Opponent HUD */}
            <div className="relative mt-4">
              <div className="absolute -right-2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-400 to-transparent rounded-full"
                style={{ boxShadow: '0 0 10px rgba(236,72,153,0.5)' }}></div>
              <div className="bg-black/40 backdrop-blur border border-pink-400/30 rounded-lg p-3 mr-2">
                <div className="flex items-center gap-3">
                  <div className="text-pink-400 text-2xl font-mono font-bold"
                    style={{ textShadow: '0 0 10px rgba(236,72,153,0.5)' }}>
                    {sortedSets.filter(s => s.opponent_score > s.player_score).length}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-pink-400 text-xs font-mono uppercase">{isDoubles ? 'Team 2' : 'Player 2'}</div>
                    {isDoubles ? (
                      <div className="space-y-0.5">
                        <div className="text-white font-bold truncate text-sm">
                          {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                        </div>
                        <div className="text-white font-bold truncate text-sm">
                          {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-white font-bold truncate text-sm">
                        {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                      </div>
                    )}
                  </div>
                  {isDoubles ? (
                    <div className="flex -space-x-2 flex-shrink-0">
                      <Avatar src={match.opponent_profile?.avatar_url} size="md" className="bg-gradient-to-br from-pink-400/20 to-purple-400/20 text-pink-400 ring-2 ring-pink-400/30" />
                      <Avatar src={match.opponent_partner_profile?.avatar_url} size="md" className="bg-gradient-to-br from-pink-400/20 to-purple-400/20 text-pink-400 ring-2 ring-pink-400/30" />
                    </div>
                  ) : (
                    <Avatar src={match.opponent_profile?.avatar_url} size="lg" className="bg-gradient-to-br from-pink-400/20 to-purple-400/20 text-pink-400 rounded-lg border border-pink-400/30" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score Sets */}
          <div className="bg-black/40 backdrop-blur border border-white/10 rounded-lg p-3 mt-4">
            <div className="text-center">
              <div className="text-white/50 text-[10px] font-mono uppercase tracking-wider mb-1">Final Score</div>
              <div className="text-white font-mono text-xl font-bold tracking-wider"
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                {formatScore()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-1 text-center space-y-1">
            <div className="text-white/40 text-[10px] font-mono">
              {match.location || 'Tennis Court'} {'// '}{formatShortDate(match.played_at)}
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 text-[10px] font-outfit font-semibold tracking-widest">
              MATCHPOST
            </div>
          </div>
        </div>
      </div>
    )
  }
)

NeonTemplate.displayName = 'NeonTemplate'
