import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { ScoreboardTable } from '../components/ScoreboardTable'

export const PhotoProTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, nameDisplayMode, backgroundImage, hasCustomBg, formatDate, sortedSets }, ref) => (
    <div
      ref={ref}
      data-card
      className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative bg-gray-900"
    >
      <img
          src={hasCustomBg ? backgroundImage! : '/blue-court.jpg'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>

      <div className="h-full flex flex-col relative z-10 font-outfit">
        <div className="flex-1 min-h-[120px] flex items-end justify-center pb-3">
          <div className="text-center">
            <div className="text-white font-outfit font-black text-4xl tracking-widest">TENNIS</div>
            <div className="text-white/70 text-[10px] font-medium uppercase tracking-widest">Match Result</div>
          </div>
        </div>

        <div className="px-4 flex-shrink-0">
          <ScoreboardTable
            headerColor="#1f2937"
            match={match}
            profile={profile}
            displayName={displayName}
            nameDisplayMode={nameDisplayMode}
            sortedSets={sortedSets}
          />
        </div>

        <div className="mt-4 pb-16 text-center space-y-1 flex-shrink-0">
          <div className="text-white/90 text-xs font-medium">{formatDate(match.played_at)}</div>
          <div className="text-white/50 text-[9px] font-semibold tracking-widest">matchpost.app</div>
        </div>
      </div>
    </div>
  )
)

PhotoProTemplate.displayName = 'PhotoProTemplate'
