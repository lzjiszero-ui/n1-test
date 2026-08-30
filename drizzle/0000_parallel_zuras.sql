CREATE TABLE `wrong_answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` text NOT NULL,
	`question_id` integer NOT NULL,
	`module` text NOT NULL,
	`question_type` text NOT NULL,
	`chosen` integer NOT NULL,
	`reason` text DEFAULT '待分析' NOT NULL,
	`mastered` integer DEFAULT false NOT NULL,
	`next_review` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_wrong_answers_device_question` ON `wrong_answers` (`device_id`,`question_id`);
--> statement-breakpoint
PRAGMA optimize;
