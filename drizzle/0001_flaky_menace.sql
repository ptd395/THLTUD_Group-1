CREATE TABLE `metrics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`ts` int NOT NULL,
	`channel` enum('web_chat','voice_demo','hotline_agent_assist') NOT NULL,
	`language` enum('vi','en') NOT NULL,
	`messageText` text,
	`messageRole` enum('user','bot') NOT NULL,
	`serviceLabel` int,
	`labelConfidence` decimal(3,2),
	`needsClarification` boolean DEFAULT false,
	`sentimentLabel` enum('negative','neutral','positive'),
	`sentimentScore` decimal(3,2),
	`escalationSuggested` boolean DEFAULT false,
	`negativeStreak` int DEFAULT 0,
	`latencyMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metrics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `sessionId_idx` ON `metrics_events` (`sessionId`);--> statement-breakpoint
CREATE INDEX `ts_idx` ON `metrics_events` (`ts`);--> statement-breakpoint
CREATE INDEX `channel_idx` ON `metrics_events` (`channel`);--> statement-breakpoint
CREATE INDEX `serviceLabel_idx` ON `metrics_events` (`serviceLabel`);