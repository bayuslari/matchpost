'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2, X, Edit3 } from 'lucide-react'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showIcon?: boolean
}

interface NominatimResult {
  place_id: number
  display_name: string
  name?: string
  type?: string
  class?: string
  address: {
    amenity?: string
    leisure?: string
    building?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    country?: string
  }
}

export default function LocationInput({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
  showIcon = true,
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setHasSearched(false)
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    setHasSearched(false)
    try {
      // Using OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data: NominatimResult[] = await response.json()
      setSuggestions(data)
      setHasSearched(true)
      setShowDropdown(true) // Always show dropdown after search
    } catch (error) {
      console.error('Location search error:', error)
      setSuggestions([])
      setHasSearched(true)
      setShowDropdown(true) // Show dropdown even on error to allow manual input
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue)
    }, 300)
  }

  const handleSelectLocation = (result: NominatimResult) => {
    const address = result.address

    // Check if it's a specific venue (stadium, sports facility, etc.)
    const venueName = address.amenity || address.leisure || address.building || result.name || ''
    const city = address.city || address.town || address.village || address.municipality || address.suburb || ''
    const country = address.country || ''

    let locationString = ''

    if (venueName && city) {
      // For venues: "Venue Name, City"
      locationString = `${venueName}, ${city}`
    } else if (venueName && country) {
      // For venues without city: "Venue Name, Country"
      locationString = `${venueName}, ${country}`
    } else if (city && country) {
      // For cities: "City, Country"
      locationString = `${city}, ${country}`
    } else {
      // Fallback to first 2 parts of display name
      locationString = result.display_name.split(',').slice(0, 2).join(',').trim()
    }

    setInputValue(locationString)
    onChange(locationString)
    setSuggestions([])
    setShowDropdown(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setSuggestions([])
    setHasSearched(false)
    inputRef.current?.focus()
  }

  const handleUseCustomLocation = () => {
    // Just close dropdown and keep the current input value
    setShowDropdown(false)
    setSuggestions([])
    setHasSearched(false)
  }

  const formatDisplayName = (result: NominatimResult) => {
    const address = result.address

    // Check if it's a venue (stadium, sports facility, etc.)
    const venueName = address.amenity || address.leisure || address.building || result.name || ''
    const city = address.city || address.town || address.village || address.municipality || address.suburb || ''
    const country = address.country || ''

    if (venueName) {
      // For venues: show "Venue Name, City, Country"
      const parts = [venueName, city, country].filter(Boolean)
      return parts.slice(0, 3).join(', ')
    }

    // For regular places: "City, State, Country"
    const state = address.state || ''
    const parts = [city, state, country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : result.display_name.split(',').slice(0, 3).join(',')
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          setIsFocused(true)
          if (suggestions.length > 0) setShowDropdown(true)
        }}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 ${showIcon ? 'pl-10' : ''} ${inputValue ? 'pr-10' : ''}`}
      />
      {showIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <MapPin className={`w-5 h-5 ${isFocused ? 'text-yellow-500' : 'text-gray-400'}`} />
          )}
        </div>
      )}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {/* Dropdown */}
      {showDropdown && hasSearched && inputValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                    {formatDisplayName(result)}
                  </span>
                </button>
              ))}
              {/* Custom location option */}
              <button
                type="button"
                onClick={handleUseCustomLocation}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
              >
                <Edit3 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Use &quot;{inputValue}&quot; as custom location
                </span>
              </button>
            </>
          ) : (
            <>
              {/* No results message */}
              <div className="flex items-center gap-3 px-4 py-3">
                <MapPin className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No locations found for &quot;{inputValue}&quot;
                </span>
              </div>
              {/* Custom location option when no results */}
              <button
                type="button"
                onClick={handleUseCustomLocation}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left border-t border-gray-100 dark:border-gray-700"
              >
                <Edit3 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Use &quot;{inputValue}&quot; as custom location
                </span>
              </button>
            </>
          )}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <span className="text-[10px] text-gray-400">
              Powered by OpenStreetMap • You can also type any location manually
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
