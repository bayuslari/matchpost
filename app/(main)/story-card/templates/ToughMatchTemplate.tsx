import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { formatProfileName } from '../types'

export const ToughMatchTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, displayName, nameDisplayMode, formatShortDate, sortedSets }, ref) => {
    const isDoubles = match.match_type === 'doubles'

    const opponentName = formatProfileName(
      match.opponent_profile,
      match.opponent_name,
      'Opponent',
      nameDisplayMode
    )

    const partnerName = isDoubles
      ? formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)
      : null

    const opponentPartnerName = isDoubles
      ? formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)
      : null

    // Build score string from sets
    const scoreStr = sortedSets.length > 0
      ? sortedSets.map(s => `${s.player_score}-${s.opponent_score}`).join(', ')
      : '-'

    return (
      <div
        ref={ref}
        data-card
        className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative font-outfit"
        style={{ background: '#1a1a2e' }}
      >
        {/* Subtle top-right glow */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)',
          }}
        />
        {/* Subtle bottom-left glow */}
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 h-full flex flex-col px-6 py-7">
          {/* Top: icon + close match chip */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-3xl leading-none">⚔️</span>
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{ background: 'rgba(249,115,22,0.18)', color: '#f97316', border: '1px solid rgba(249,115,22,0.35)' }}
            >
              Close Match
            </div>
          </div>

          {/* Headline */}
          <div className="mb-1">
            <div
              className="text-4xl font-black uppercase leading-none tracking-tight"
              style={{ color: '#f97316', textShadow: '0 0 40px rgba(249,115,22,0.4)' }}
            >
              FOUGHT
            </div>
            <div className="text-4xl font-black uppercase leading-none tracking-tight text-white">
              HARD
            </div>
          </div>

          {/* Divider */}
          <div
            className="my-4 h-px w-full"
            style={{ background: 'linear-gradient(to right, rgba(249,115,22,0.6), transparent)' }}
          />

          {/* Player + score */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {/* Player side */}
            <div>
              <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">You</div>
              <div className="text-white font-bold text-base leading-tight">
                {displayName}
                {isDoubles && partnerName && (
                  <span className="text-white/60 font-normal"> & {partnerName}</span>
                )}
              </div>
              <div
                className="text-lg font-black tracking-wider mt-0.5"
                style={{ color: '#f97316' }}
              >
                {scoreStr}
              </div>
            </div>

            {/* VS line */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-white/30 text-[10px] font-bold">VS</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Opponent side */}
            <div>
              <div className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Opponent</div>
              <div className="text-white/70 font-semibold text-base leading-tight">
                {opponentName}
                {isDoubles && opponentPartnerName && (
                  <span className="text-white/40 font-normal"> & {opponentPartnerName}</span>
                )}
              </div>
            </div>

            {/* Set breakdown */}
            {sortedSets.length > 0 && (
              <div className="flex gap-2 mt-1">
                {sortedSets.map((set) => (
                  <div
                    key={set.set_number}
                    className="flex flex-col items-center px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-white/30 text-[8px] uppercase tracking-wider mb-0.5">S{set.set_number}</span>
                    <span className="text-white font-bold text-xs">{set.player_score}</span>
                    <span className="text-white/30 text-[8px]">—</span>
                    <span className="text-white/50 text-xs">{set.opponent_score}</span>
                    {(set.tiebreak_player !== null || set.tiebreak_opponent !== null) && (
                      <span className="text-[7px] mt-0.5" style={{ color: '#f97316' }}>TB</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 space-y-1">
            <div className="text-white/25 text-[9px] tracking-wider">
              {match.location ? `${match.location} · ` : ''}{formatShortDate(match.played_at)}
            </div>
            <div className="text-white/25 text-[8px] font-semibold tracking-widest">matchpost.app</div>
          </div>
        </div>
      </div>
    )
  }
)

ToughMatchTemplate.displayName = 'ToughMatchTemplate'
