-- MatchPost Database Schema - PART 2: RLS & FUNCTIONS
-- Run this AFTER 01-tables.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- MATCHES POLICIES
-- ============================================
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own matches"
  ON matches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON matches FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MATCH_SETS POLICIES
-- ============================================
CREATE POLICY "Users can view sets of accessible matches"
  ON match_sets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_sets.match_id
    AND (matches.user_id = auth.uid() OR matches.is_public = true)
  ));

CREATE POLICY "Users can insert sets for their matches"
  ON match_sets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_sets.match_id
    AND matches.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sets for their matches"
  ON match_sets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_sets.match_id
    AND matches.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sets for their matches"
  ON match_sets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_sets.match_id
    AND matches.user_id = auth.uid()
  ));

-- ============================================
-- GROUPS POLICIES
-- ============================================
CREATE POLICY "Public groups are viewable by everyone"
  ON groups FOR SELECT USING (is_public = true OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- GROUP_MEMBERS POLICIES
-- ============================================
CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.is_public = true
    )
  );

CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_id
      AND groups.is_public = true
    )
  );

CREATE POLICY "Admins can manage members"
  ON group_members FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add creator as admin when group is created
CREATE OR REPLACE FUNCTION handle_new_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION handle_new_group();

-- Calculate match result from sets
CREATE OR REPLACE FUNCTION calculate_match_result(p_match_id UUID)
RETURNS TEXT AS $$
DECLARE
  player_sets INT;
  opponent_sets INT;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE player_score > opponent_score),
    COUNT(*) FILTER (WHERE opponent_score > player_score)
  INTO player_sets, opponent_sets
  FROM match_sets
  WHERE match_id = p_match_id;

  IF player_sets > opponent_sets THEN
    RETURN 'win';
  ELSIF opponent_sets > player_sets THEN
    RETURN 'loss';
  ELSE
    RETURN 'draw';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Auto-update match result when sets change
CREATE OR REPLACE FUNCTION update_match_result()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches
  SET result = calculate_match_result(
    COALESCE(NEW.match_id, OLD.match_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.match_id, OLD.match_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_set_change
  AFTER INSERT OR UPDATE OR DELETE ON match_sets
  FOR EACH ROW EXECUTE FUNCTION update_match_result();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================
CREATE OR REPLACE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_matches,
  COUNT(*) FILTER (WHERE result = 'win') as wins,
  COUNT(*) FILTER (WHERE result = 'loss') as losses,
  COUNT(*) FILTER (WHERE result = 'draw') as draws,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'win')::DECIMAL /
    NULLIF(COUNT(*), 0) * 100, 1
  ) as win_percentage,
  COUNT(*) FILTER (WHERE match_type = 'singles') as singles_matches,
  COUNT(*) FILTER (WHERE match_type = 'doubles') as doubles_matches
FROM matches
GROUP BY user_id;
