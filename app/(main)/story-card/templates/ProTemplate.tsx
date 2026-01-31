import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { ScoreboardTable } from '../components/ScoreboardTable'

export const ProTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, nameDisplayMode, formatDate, sortedSets }, ref) => (
    <div
      ref={ref}
      data-card
      className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative bg-[#1a6b9c]"
    >
      <img
        src="/ao-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>

      <div className="h-full flex flex-col relative z-10 font-outfit">
        <div className="flex-1 min-h-[150px]"></div>

        <div className="px-4 flex-shrink-0">
          <ScoreboardTable
            headerColor="#134D6B"
            match={match}
            profile={profile}
            displayName={displayName}
            nameDisplayMode={nameDisplayMode}
            sortedSets={sortedSets}
          />
        </div>

        <div className="mt-4 pb-16 text-center space-y-1 flex-shrink-0">
          <div className="text-white/90 text-xs font-medium">{formatDate(match.played_at)}</div>
          <div className="text-white/50 text-[9px] font-semibold tracking-widest">MATCHPOST.APP</div>
        </div>
      </div>
    </div>
  )
)

ProTemplate.displayName = 'ProTemplate'
