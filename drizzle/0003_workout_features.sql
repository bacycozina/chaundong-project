ALTER TABLE users ADD COLUMN ranking_public INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN nudges_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pokes ADD COLUMN read_at INTEGER;
CREATE TABLE photo_cleanup (photo_key TEXT PRIMARY KEY NOT NULL);
CREATE TABLE goal_changes (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,effective_week INTEGER NOT NULL,days INTEGER NOT NULL CHECK(days BETWEEN 1 AND 7),PRIMARY KEY(user_id,effective_week));
CREATE TABLE challenges (id TEXT PRIMARY KEY NOT NULL,club_id TEXT NOT NULL REFERENCES clubs(id),creator_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,kind TEXT NOT NULL,target_days INTEGER NOT NULL,starts_at INTEGER NOT NULL,ends_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX challenges_club ON challenges(club_id,starts_at);
CREATE TABLE challenge_members (challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(challenge_id,user_id));
