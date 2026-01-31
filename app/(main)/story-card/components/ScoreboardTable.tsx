import type { MatchSet, Profile } from '@/lib/database.types'
import type { MatchWithSets, NameDisplayMode } from '../types'

interface ScoreboardTableProps {
  headerColor: string
  match: MatchWithSets
  profile: Profile | null
  displayName: string
  nameDisplayMode: NameDisplayMode
  sortedSets: MatchSet[]
}

// Helper function to format profile name based on display mode
function formatProfileName(
  linkedProfile: Profile | null | undefined,
  fallbackName: string | null | undefined,
  defaultLabel: string,
  nameDisplayMode: NameDisplayMode
): string {
  if (!linkedProfile) {
    return fallbackName || defaultLabel
  }

  if (nameDisplayMode === 'username' && linkedProfile.username) {
    return `@${linkedProfile.username}`
  }

  return linkedProfile.full_name || linkedProfile.username || fallbackName || defaultLabel
}

export function ScoreboardTable({ headerColor, match, profile, displayName, nameDisplayMode, sortedSets }: ScoreboardTableProps) {
  return (
    <>
      {/* Match Type Header Row */}
      <div className="backdrop-blur-sm rounded-t-xl px-3 py-2 flex justify-between items-center" style={{ backgroundColor: `${headerColor}E6` }}>
        <span className="text-white text-xs font-semibold">
          {match.match_type === 'doubles' ? 'Doubles' : 'Singles'}
        </span>
        <div className="flex gap-0.5">
          {sortedSets.map((_, i) => (
            <span key={i} className="text-white/90 text-xs font-semibold w-7 text-center">{i + 1}</span>
          ))}
        </div>
      </div>

      {/* Player Row(s) */}
      {match.match_type === 'doubles' ? (
        <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-gray-100">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="font-semibold text-sm text-gray-900 truncate">{displayName}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                {match.partner_profile?.avatar_url ? (
                  <img src={match.partner_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="font-semibold text-sm text-gray-900 truncate">
                {formatProfileName(match.partner_profile, match.partner_name, 'Partner', nameDisplayMode)}
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 items-center">
            {sortedSets.map((set) => {
              const isSetWinner = set.player_score > set.opponent_score
              return (
                <div
                  key={set.set_number}
                  className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-sm ${
                    isSetWinner
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={isSetWinner ? { backgroundColor: headerColor } : {}}
                >
                  {set.player_score}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white px-3 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{displayName}</div>
          </div>
          <div className="flex gap-0.5">
            {sortedSets.map((set) => {
              const isSetWinner = set.player_score > set.opponent_score
              return (
                <div
                  key={set.set_number}
                  className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-sm ${
                    isSetWinner
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={isSetWinner ? { backgroundColor: headerColor } : {}}
                >
                  {set.player_score}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Opponent Row(s) */}
      {match.match_type === 'doubles' ? (
        <div className="bg-white px-3 py-2 flex items-center gap-2 rounded-b-xl">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                {match.opponent_profile?.avatar_url ? (
                  <img src={match.opponent_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="font-semibold text-sm text-gray-900 truncate">
                {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                {match.opponent_partner_profile?.avatar_url ? (
                  <img src={match.opponent_partner_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <div className="font-semibold text-sm text-gray-900 truncate">
                {formatProfileName(match.opponent_partner_profile, match.opponent_partner_name, 'Partner', nameDisplayMode)}
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 items-center">
            {sortedSets.map((set) => {
              const isSetWinner = set.opponent_score > set.player_score
              return (
                <div
                  key={set.set_number}
                  className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-sm ${
                    isSetWinner
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={isSetWinner ? { backgroundColor: headerColor } : {}}
                >
                  {set.opponent_score}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white px-3 py-2.5 flex items-center gap-2 rounded-b-xl">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
            {match.opponent_profile?.avatar_url ? (
              <img src={match.opponent_profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">
              {formatProfileName(match.opponent_profile, match.opponent_name, 'Opponent', nameDisplayMode)}
            </div>
          </div>
          <div className="flex gap-0.5">
            {sortedSets.map((set) => {
              const isSetWinner = set.opponent_score > set.player_score
              return (
                <div
                  key={set.set_number}
                  className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-sm ${
                    isSetWinner
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={isSetWinner ? { backgroundColor: headerColor } : {}}
                >
                  {set.opponent_score}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Match Info Footer */}
      <div className="backdrop-blur-sm rounded-xl mt-2 px-3 py-2 flex justify-between items-center" style={{ backgroundColor: `${headerColor}E6` }}>
        <span className="text-white text-[10px] font-semibold">
          {match.location || 'Tennis Court'}
        </span>
        <span className="text-white text-[10px] font-bold">
          {match.result === 'win' ? '🏆 Victory' : match.result === 'loss' ? 'Match Complete' : 'Draw'}
        </span>
      </div>
    </>
  )
}
