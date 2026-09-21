CREATE TABLE pokes (id text PRIMARY KEY NOT NULL,sender_id text NOT NULL,recipient_id text NOT NULL,created_at integer NOT NULL);
--> statement-breakpoint
CREATE INDEX pokes_recipient_id ON pokes (recipient_id);
--> statement-breakpoint
CREATE INDEX pokes_created_at ON pokes (created_at);
