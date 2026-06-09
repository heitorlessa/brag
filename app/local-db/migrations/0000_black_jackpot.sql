CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`impact` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`occurred_at` text NOT NULL,
	`goal_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `enablement` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'workshop' NOT NULL,
	`audience` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`attendees` integer,
	`link` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `energy_reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` text NOT NULL,
	`energy` integer NOT NULL,
	`workload` integer NOT NULL,
	`satisfaction` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `energy_week_start_unq` ON `energy_reflections` (`week_start`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`year` integer NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`target_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mentoring_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`date` text NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`relationship` text DEFAULT 'ad_hoc' NOT NULL,
	`cadence` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`started_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
