// Google Analytics utility

export const GA_MEASUREMENT_ID = 'G-XLQDP3NBSD'

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Custom event types
type EventName =
  // Match events
  | 'record_match_start'
  | 'record_match_complete'
  | 'edit_match'
  | 'delete_match'
  // Story card events
  | 'view_story_card'
  | 'select_template'
  | 'upload_background'
  | 'remove_background'
  | 'toggle_name_display'
  | 'share_story'
  | 'download_story'
  | 'skip_story'
  // Auth events
  | 'login_click'
  | 'signup_click'
  | 'logout'
  | 'guest_mode_start'
  // Navigation events
  | 'nav_home'
  | 'nav_community'
  | 'nav_stats'
  | 'nav_profile'
  // Profile events
  | 'update_profile'
  | 'upload_avatar'
  | 'complete_profile_banner_click'
  // Other
  | 'new_match_click'

type EventParams = {
  // Match params
  match_type?: 'singles' | 'doubles'
  match_result?: 'win' | 'loss' | 'draw'
  sets_count?: number
  // Story card params
  template_id?: string
  template_name?: string
  has_background?: boolean
  name_display_mode?: 'username' | 'fullname'
  share_method?: 'native' | 'download'
  // Auth params
  auth_method?: 'google' | 'email'
  is_guest?: boolean
  // Generic
  source?: string
  [key: string]: string | number | boolean | undefined
}

// Track custom events
export const trackEvent = (eventName: EventName, params?: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}
