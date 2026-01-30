# MatchPost 🎾

Tennis match recording and sharing app. Record your matches, create beautiful story cards, and compete with friends in groups.

## Features

- 📊 **Record Matches** - Track your tennis matches with detailed scores
- 📸 **Story Cards** - Generate Instagram-ready story cards with custom backgrounds
- 👥 **Groups** - Create or join groups to compete with friends
- 🏆 **Leaderboards** - Track rankings within your groups
- 📈 **Statistics** - View detailed stats about your performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **Image Generation**: html2canvas

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/matchpost.git
cd matchpost
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL files in `/supabase` folder in order
   - Enable Google OAuth in Authentication settings

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## How to Use

### 1. Sign In
- Open the app and click "Sign in with Google"
- Authorize with your Google account

### 2. Record a Match
- From Dashboard, tap "New Match"
- Select match type (Singles/Doubles)
- Enter opponent name
- Input scores for each set (e.g., 6-4, 6-2)
- Add location (optional)
- Select date
- Tap "Save & Create Story Card"

### 3. Create Story Card
- After saving a match, you'll be taken to Story Card creator
- Choose a template (Sporty, Dark, Neon, Minimal)
- Upload your own background photo (optional)
- Tap "Share to Instagram Story" or "Save to Gallery"

### 4. View Statistics
- Go to Profile or Stats page
- See your win rate, streaks, and monthly performance
- Track your progress over time

### 5. Join/Create Groups
- Tap "Groups" from Dashboard
- Create a new group or join existing ones
- Compete with friends on leaderboards

## Screenshots

Coming soon...

## License

MIT
