CREATE TABLE `cheers` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `user_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`minutes` integer NOT NULL,
	`note` text NOT NULL,
	`photo_key` text,
	`created_at` integer NOT NULL
);

--> statement-breakpoint
CREATE INDEX `posts_created_at` ON `posts` (`created_at`);
--> statement-breakpoint
CREATE INDEX `posts_user_id` ON `posts` (`user_id`);