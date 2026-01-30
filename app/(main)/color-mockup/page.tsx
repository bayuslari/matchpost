'use client'

import { useState } from 'react'
import { Plus, LogIn, Check } from 'lucide-react'

type ColorOption = 'lime' | 'teal' | 'cyan' | 'emerald' | 'yellow'

export default function ColorMockupPage() {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)

  return (
    <div className="min-h-dvh bg-gray-100 dark:bg-gray-900 pb-8">
      {/* Color Selection Header */}
      <div className="bg-gray-800 text-white p-4 text-center sticky top-0 z-50">
        <h1 className="text-lg font-bold mb-1">Pilih Warna Brand MatchPost</h1>
        <p className="text-sm text-gray-300">Scroll untuk melihat semua opsi warna</p>
      </div>

      <div className="flex flex-col gap-6 p-4 max-w-md mx-auto">

        {/* OPTION 1: Lime #84CC16 */}
        <div className={`rounded-2xl overflow-hidden border-4 transition-all ${selectedColor === 'lime' ? 'border-lime-500 ring-4 ring-lime-500/30' : 'border-transparent'}`}>
          <button
            onClick={() => setSelectedColor('lime')}
            className="w-full text-left"
          >
            {/* Color Info */}
            <div className="bg-lime-500 text-white p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">Lime</span>
                <span className="ml-2 text-lime-100 text-sm">#84CC16</span>
              </div>
              {selectedColor === 'lime' && (
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-lime-500" />
                </div>
              )}
            </div>

            {/* Dashboard Mockup */}
            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="bg-gradient-to-r from-lime-600 to-lime-500 text-white p-5 pb-14 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lime-100 text-xs">Welcome back</p>
                    <h1 className="text-lg font-bold">Player Name</h1>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <LogIn className="w-3 h-3" />
                    <span className="font-semibold">Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-lime-100">Matches</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">75%</div>
                    <div className="text-xs text-lime-100">Win Rate</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-lime-100">Streak</div>
                  </div>
                </div>
              </div>
              <div className="px-4 -mt-6 pb-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2 bg-lime-50 dark:bg-lime-900/30 rounded-lg p-3">
                    <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 pb-4 text-xs text-gray-500">
              Fresh, energetik, unik - tidak mirip kompetitor
            </div>
          </button>
        </div>

        {/* OPTION 2: Teal #14B8A6 */}
        <div className={`rounded-2xl overflow-hidden border-4 transition-all ${selectedColor === 'teal' ? 'border-teal-500 ring-4 ring-teal-500/30' : 'border-transparent'}`}>
          <button
            onClick={() => setSelectedColor('teal')}
            className="w-full text-left"
          >
            <div className="bg-teal-500 text-white p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">Teal</span>
                <span className="ml-2 text-teal-100 text-sm">#14B8A6</span>
              </div>
              {selectedColor === 'teal' && (
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-teal-500" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-5 pb-14 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-teal-100 text-xs">Welcome back</p>
                    <h1 className="text-lg font-bold">Player Name</h1>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <LogIn className="w-3 h-3" />
                    <span className="font-semibold">Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-teal-100">Matches</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">75%</div>
                    <div className="text-xs text-teal-100">Win Rate</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-teal-100">Streak</div>
                  </div>
                </div>
              </div>
              <div className="px-4 -mt-6 pb-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 pb-4 text-xs text-gray-500">
              Modern, tech-forward, professional
            </div>
          </button>
        </div>

        {/* OPTION 3: Cyan #06B6D4 */}
        <div className={`rounded-2xl overflow-hidden border-4 transition-all ${selectedColor === 'cyan' ? 'border-cyan-500 ring-4 ring-cyan-500/30' : 'border-transparent'}`}>
          <button
            onClick={() => setSelectedColor('cyan')}
            className="w-full text-left"
          >
            <div className="bg-cyan-500 text-white p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">Cyan</span>
                <span className="ml-2 text-cyan-100 text-sm">#06B6D4</span>
              </div>
              {selectedColor === 'cyan' && (
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-cyan-500" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white p-5 pb-14 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-cyan-100 text-xs">Welcome back</p>
                    <h1 className="text-lg font-bold">Player Name</h1>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <LogIn className="w-3 h-3" />
                    <span className="font-semibold">Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-cyan-100">Matches</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">75%</div>
                    <div className="text-xs text-cyan-100">Win Rate</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-cyan-100">Streak</div>
                  </div>
                </div>
              </div>
              <div className="px-4 -mt-6 pb-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg p-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 pb-4 text-xs text-gray-500">
              Fresh, digital, sporty vibes
            </div>
          </button>
        </div>

        {/* OPTION 4: Emerald #10B981 */}
        <div className={`rounded-2xl overflow-hidden border-4 transition-all ${selectedColor === 'emerald' ? 'border-emerald-500 ring-4 ring-emerald-500/30' : 'border-transparent'}`}>
          <button
            onClick={() => setSelectedColor('emerald')}
            className="w-full text-left"
          >
            <div className="bg-emerald-500 text-white p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">Emerald</span>
                <span className="ml-2 text-emerald-100 text-sm">#10B981</span>
              </div>
              {selectedColor === 'emerald' && (
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-5 pb-14 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-100 text-xs">Welcome back</p>
                    <h1 className="text-lg font-bold">Player Name</h1>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                    <LogIn className="w-3 h-3" />
                    <span className="font-semibold">Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-emerald-100">Matches</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">75%</div>
                    <div className="text-xs text-emerald-100">Win Rate</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-emerald-100">Streak</div>
                  </div>
                </div>
              </div>
              <div className="px-4 -mt-6 pb-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 pb-4 text-xs text-gray-500">
              Premium green, lebih sophisticated dari current
            </div>
          </button>
        </div>

        {/* OPTION 5: Yellow #EAB308 */}
        <div className={`rounded-2xl overflow-hidden border-4 transition-all ${selectedColor === 'yellow' ? 'border-yellow-500 ring-4 ring-yellow-500/30' : 'border-transparent'}`}>
          <button
            onClick={() => setSelectedColor('yellow')}
            className="w-full text-left"
          >
            <div className="bg-yellow-500 text-white p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">Yellow</span>
                <span className="ml-2 text-yellow-100 text-sm">#EAB308</span>
              </div>
              {selectedColor === 'yellow' && (
                <div className="bg-white rounded-full p-1">
                  <Check className="w-5 h-5 text-yellow-500" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 p-5 pb-14 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-yellow-800 text-xs">Welcome back</p>
                    <h1 className="text-lg font-bold">Player Name</h1>
                  </div>
                  <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full text-sm">
                    <LogIn className="w-3 h-3" />
                    <span className="font-semibold">Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/10 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-yellow-800">Matches</div>
                  </div>
                  <div className="bg-black/10 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">75%</div>
                    <div className="text-xs text-yellow-800">Win Rate</div>
                  </div>
                  <div className="bg-black/10 rounded-xl p-2 text-center">
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-yellow-800">Streak</div>
                  </div>
                </div>
              </div>
              <div className="px-4 -mt-6 pb-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-3">
                  <div className="flex items-center justify-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 pb-4 text-xs text-gray-500">
              Paling mirip bola tenis - berbeda dari Reclub & Shopee
            </div>
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mt-2">
          <h2 className="font-bold text-gray-800 dark:text-white mb-3">Ringkasan:</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-lime-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Lime - Fresh & energetik</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-teal-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Teal - Modern & professional</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Cyan - Digital & sporty</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Emerald - Premium green</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Yellow - Bola tenis vibes</span>
            </div>
          </div>
        </div>

        {/* Selection Result */}
        {selectedColor && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-4 text-white sticky bottom-4">
            <p className="text-center">
              Pilihan: <span className="font-bold text-lg capitalize">{selectedColor}</span>
            </p>
            <p className="text-center text-sm text-gray-400 mt-1">
              Beritahu saya jika sudah yakin!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
