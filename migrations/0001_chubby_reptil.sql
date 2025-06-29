CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nurse_id` integer NOT NULL,
	`mission_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`metadata` text DEFAULT '{}',
	`is_read` integer DEFAULT false,
	`is_sent` integer DEFAULT false,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`read_at` integer,
	`sent_at` integer,
	FOREIGN KEY (`nurse_id`) REFERENCES `nurse_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`mission_id`) REFERENCES `missions`(`id`) ON UPDATE no action ON DELETE cascade
);
