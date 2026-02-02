'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const EMOJI_CATEGORIES = {
  'Sports': ['🎾', '🏸', '⚽', '🏀', '🏈', '⚾', '🥎', '🏐', '🏉', '🎱', '🏓', '🏒', '🥊', '🥋', '⛳', '🏌️', '🏇', '⛷️', '🏂', '🏋️'],
  'Activities': ['🏃', '🚴', '🏊', '🧘', '🤸', '⛹️', '🤾', '🚣', '🧗', '🤺'],
  'Awards': ['🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '⭐', '🌟', '💫', '✨'],
  'Fun': ['🔥', '💪', '👊', '🤝', '👏', '🙌', '💯', '🎯', '🎪', '🎨'],
  'Nature': ['🌍', '🌎', '🌏', '🌴', '🌲', '🌳', '🌵', '🌸', '🌺', '🌻'],
  'Objects': ['📍', '🏠', '🏟️', '🎪', '⛺', '🏕️', '🗓️', '📅', '🎫', '🎟️'],
}

type EmojiPickerProps = {
  selectedEmoji: string
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ selectedEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('Sports')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white">Choose Icon</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100 dark:border-gray-700">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji)
                  onClose()
                }}
                className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Preview */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedEmoji}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Selected icon</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
