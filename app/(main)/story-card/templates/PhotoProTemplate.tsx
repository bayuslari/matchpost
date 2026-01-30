import { forwardRef } from 'react'
import type { TemplateProps } from '../types'
import { ScoreboardTable } from '../components/ScoreboardTable'

export const PhotoProTemplate = forwardRef<HTMLDivElement, TemplateProps>(
  ({ match, profile, displayName, backgroundImage, hasCustomBg, formatDate, sortedSets }, ref) => (
    <div
      ref={ref}
      data-card
      className="mx-auto w-72 h-[504px] rounded-3xl overflow-hidden shadow-2xl relative bg-gray-900"
    >
      {hasCustomBg ? (
        <>
          <img
            src={backgroundImage!}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.2"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </>
      )}

      <div className="h-full flex flex-col relative z-10 font-outfit">
        <div className="flex-1 min-h-[120px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-1">🎾</div>
            <div className="text-white/70 text-xs font-medium uppercase tracking-widest">Match Result</div>
          </div>
        </div>

        <div className="px-4 flex-shrink-0">
          <ScoreboardTable
            headerColor="#1f2937"
            match={match}
            profile={profile}
            displayName={displayName}
            sortedSets={sortedSets}
          />
        </div>

        <div className="flex-1 min-h-[10px]"></div>

        <div className="pb-4 text-center space-y-1 flex-shrink-0">
          <div className="text-white/90 text-sm font-medium">{formatDate(match.played_at)}</div>
          <div className="text-white/50 text-[10px] font-semibold tracking-widest">MATCHPOST</div>
        </div>
      </div>
    </div>
  )
)

PhotoProTemplate.displayName = 'PhotoProTemplate'
