# Claude Rules for MatchPost

## Code Style

### Profile Header Layout
- Keep profile info compact and well-aligned
- Username should be on same line or close to name
- Location and skill level should be on separate lines for readability
- Use consistent icon sizes (w-3.5 h-3.5 for small info items)
- Long text (like location) should truncate if too long

### Story Card Templates
- Pro and Minimal templates use UPPERCASE watermark: "MATCHPOST.APP"
- Dark and PhotoPro templates use lowercase watermark: "matchpost.app"
- Default background images:
  - Pro: /ao-bg.jpg (fixed, no custom bg support)
  - PhotoPro: /blue-court.jpg
  - Dark: /roger.jpeg
  - Minimal: /clay.jpg

### User Search Input
- Recent players dropdown shows when input is focused with empty/short value
- Search dropdown shows when typing 2+ characters
- Linked user indicator should be clickable to view profile

### Dashboard Match Cards
- Opponent/partner names are clickable if they have linked profiles
- Show "Shared by" indicator for matches created by others

## Workflow Rules
- Do NOT run build after every code change
- Only run build when explicitly asked or before pushing
- Don't push until explicitly asked

## Git Commit Rules
- Always run build before pushing
- Don't push until explicitly asked
