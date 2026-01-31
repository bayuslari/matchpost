import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'

export const MinimalTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, displayName, nameDisplayMode, backgroundImage, hasCustomBg, sortedSets }, ref) => {
    const isDoubles = match.match_type === 'doubles'

    // Get individual names for doubles
    const playerName = displayName
    const partnerName = formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)
    const opponentName = formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)
    const opponentPartnerName = formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)

    return (
      <div
        ref={ref}
        data-card
        className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Background */}
        <img
          src={hasCustomBg ? backgroundImage! : '/clay.jpg'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Content */}
        <div className="h-full flex flex-col relative z-10">
          {/* Header - TENNIS MATCH POINT (top left) */}
          <div className="p-5 pt-8">
            <h1
              className="font-outfit font-black text-white leading-[0.9] tracking-tight"
              style={{
                fontSize: '42px',
                fontStyle: 'italic',
                textShadow: '3px 3px 6px rgba(0,0,0,0.4)'
              }}
            >
              TENNIS<br />
              MATCH<br />
              POINT
            </h1>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Scoreboard (right aligned) */}
          <div className="flex justify-end pr-[11px] pb-[120px]">
            <div className="bg-black/20 border border-white/90 w-32">
              {/* Team Headers */}
              <div className="flex ">
                <div className="flex-1 p-0.5">
                  <div className="text-white/50 text-[5px] font-semibold uppercase tracking-wider text-center">Team A</div>
                  {isDoubles ? (
                    <div className="space-y-0">
                      <div className="text-white text-[6px] font-medium truncate text-center">{playerName}</div>
                      <div className="text-white text-[6px] truncate text-center">{partnerName}</div>
                    </div>
                  ) : (
                    <div className="text-white text-[7px] font-medium truncate text-center">{playerName}</div>
                  )}
                </div>
                <div className="flex-1 p-0.5">
                  <div className="text-white/50 text-[5px] font-semibold uppercase tracking-wider text-center">Team B</div>
                  {isDoubles ? (
                    <div className="space-y-0">
                      <div className="text-white text-[6px] font-medium truncate text-center">{opponentName}</div>
                      <div className="text-white text-[6px] truncate text-center">{opponentPartnerName}</div>
                    </div>
                  ) : (
                    <div className="text-white text-[7px] font-medium truncate text-center">{opponentName}</div>
                  )}
                </div>
              </div>

              {/* Set Scores */}
              {sortedSets.map((set, index) => {
                const playerWon = set.player_score > set.opponent_score
                const opponentWon = set.opponent_score > set.player_score
                const isLast = index === sortedSets.length - 1
                return (
                  <div
                    key={set.set_number}
                    className={`flex items-center`}
                  >
                    <div className="flex-1 text-center">
                      <span className={`text-lg font-bold ${playerWon ? 'text-yellow-400' : 'text-white'}`}>
                        {set.player_score}
                      </span>
                    </div>
                    <div className="relative w-0">
                    
                    </div>
                    <div className="flex-1 text-center">
                      <span className={`text-lg font-bold ${opponentWon ? 'text-yellow-400' : 'text-white'}`}>
                        {set.opponent_score}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pb-9 px-5">
            <div className="text-white/50 text-[8px] font-semibold tracking-[0.15em]">
              MATCHPOST.APP
            </div>
          </div>
        </div>
      </div>
    )
  }
)

MinimalTemplate.displayName = 'MinimalTemplate'
