CREATE TABLE `vocabulary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`word` text NOT NULL,
	`kana` text NOT NULL,
	`meaning` text NOT NULL,
	`usage` text NOT NULL,
	`source_context` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vocabulary_device_word` ON `vocabulary_entries` (`device_id`,`word`);--> statement-breakpoint
CREATE INDEX `idx_vocabulary_device_updated` ON `vocabulary_entries` (`device_id`,`updated_at`);
