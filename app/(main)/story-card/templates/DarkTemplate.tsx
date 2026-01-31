import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'
import { Avatar } from '../components/Avatar'

export const DarkTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, stats, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatScore, formatShortDate }, ref) => {
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black"></div>
        )}

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        <div className="h-full flex flex-col relative z-10 p-6">
          {/* Top Badge */}
          <div className="text-center">
            <div className="inline-block border border-white/20 px-3 py-1 rounded text-[10px] text-white/60 uppercase tracking-widest">
              {isDoubles ? 'Doubles Match' : 'Singles Match'}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center text-center py-4">
            {/* Result */}
            <div className={`text-5xl font-black mb-2 ${
              match.result === 'win' ? 'text-yellow-400' : 'text-white'
            }`}>
              {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
            </div>

            {/* Score */}
            <div className="text-white text-3xl font-bold tracking-wider mb-4">
              {formatScore()}
            </div>

            {/* Players Section */}
            <div className="space-y-2">
              {/* Player */}
              <div className="flex items-center justify-center gap-3">
                {isDoubles ? (
                  <div className="flex -space-x-2">
                    <Avatar src={profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-gray-900" />
                    <Avatar src={match.partner_profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-gray-900" />
                  </div>
                ) : (
                  <Avatar src={profile?.avatar_url} size="md" className="bg-white/10 text-white/50" />
                )}
                {isDoubles ? (
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">{displayName}</div>
                    <div className="text-white font-semibold text-sm">
                      {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}
                    </div>
                  </div>
                ) : (
                  <div className="text-white font-semibold text-sm">{displayName}</div>
                )}
              </div>

              {/* VS Emphasized */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
                <div className="text-yellow-400 font-black text-xl" style={{ textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
                  VS
                </div>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
              </div>

              {/* Opponent */}
              <div className="flex items-center justify-center gap-3">
                {isDoubles ? (
                  <div className="flex -space-x-2">
                    <Avatar src={match.opponent_profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-gray-900" />
                    <Avatar src={match.opponent_partner_profile?.avatar_url} size="md" className="bg-white/10 text-white/50 ring-2 ring-gray-900" />
                  </div>
                ) : (
                  <Avatar src={match.opponent_profile?.avatar_url} size="md" className="bg-white/10 text-white/50" />
                )}
                {isDoubles ? (
                  <div className="text-left">
                    <div className="text-white/80 font-semibold text-sm">
                      {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                    </div>
                    <div className="text-white/60 text-sm">
                      {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/80 font-semibold text-sm">
                    {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-xl font-bold">{stats.winRate}%</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Win Rate</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-xl font-bold">{stats.streak > 0 ? stats.streak : 0}</div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Streak</div>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-1 text-center space-y-1">
            <div className="text-white/50 text-xs">{match.location || 'Tennis Court'} • {formatShortDate(match.played_at)}</div>
            <div className="text-white/50 text-[10px] font-outfit font-semibold tracking-widest">MATCHPOST</div>
          </div>
        </div>
      </div>
    )
  }
)

DarkTemplate.displayName = 'DarkTemplate'
