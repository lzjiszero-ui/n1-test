ALTER TABLE `wrong_answers` ADD `review_stage` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `wrong_answers` ADD `review_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `wrong_answers` ADD `last_reviewed_at` text;
--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` text NOT NULL,
	`session_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`module` text NOT NULL,
	`question_type` text NOT NULL,
	`mode` text NOT NULL,
	`chosen` integer NOT NULL,
	`correct` integer NOT NULL,
	`seconds` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attempts_device_session_question` ON `attempts` (`device_id`,`session_id`,`question_id`);
--> statement-breakpoint
CREATE INDEX `idx_attempts_device_created` ON `attempts` (`device_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `study_profiles` (
	`device_id` text PRIMARY KEY NOT NULL,
	`exam_date` text NOT NULL,
	`daily_minutes` integer DEFAULT 30 NOT NULL,
	`target_score` integer DEFAULT 120 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text NOT NULL,
	`mode` text NOT NULL,
	`total_questions` integer NOT NULL,
	`correct_questions` integer NOT NULL,
	`elapsed_seconds` integer NOT NULL,
	`completed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_learning_sessions_device_completed` ON `learning_sessions` (`device_id`,`completed_at`);
--> statement-breakpoint
PRAGMA optimize;
