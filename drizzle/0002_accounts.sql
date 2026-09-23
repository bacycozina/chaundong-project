CREATE TABLE clubs (id TEXT PRIMARY KEY NOT NULL, invite_code TEXT NOT NULL UNIQUE);
CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, club_id TEXT NOT NULL REFERENCES clubs(id), created_at INTEGER NOT NULL);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY NOT NULL,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE auth_limits (key TEXT PRIMARY KEY NOT NULL,attempts INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX auth_limits_expiry ON auth_limits(expires_at);
ALTER TABLE posts ADD COLUMN club_id TEXT;
CREATE INDEX posts_club_created ON posts(club_id,created_at);
CREATE UNIQUE INDEX pokes_daily ON pokes(sender_id,recipient_id,CAST((created_at+32400000)/86400000 AS INTEGER));
