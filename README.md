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
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/matchpost.git
cd matchpost
```

2. Install dependencies:
```bash
npm install
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

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### Create Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Users profile (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎾',
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  ranking_reset TEXT DEFAULT 'monthly',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group memberships
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Matches
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  opponent_name TEXT NOT NULL,
  match_type TEXT DEFAULT 'singles' CHECK (match_type IN ('singles', 'doubles')),
  sets JSONB NOT NULL, -- [{player: 6, opponent: 4}, ...]
  result TEXT CHECK (result IN ('win', 'loss')),
  location TEXT,
  played_at DATE DEFAULT CURRENT_DATE,
  group_id UUID REFERENCES groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public groups are viewable by everyone"
  ON groups FOR SELECT USING (privacy = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matches"
  ON matches FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Enable Google OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Project Structure

```
matchpost/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── record/
│   │   ├── story-card/
│   │   ├── groups/
│   │   ├── stats/
│   │   └── profile/
│   ├── auth/callback/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── supabase/
│   └── utils.ts
└── public/
```

## License

MIT
