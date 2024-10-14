CREATE DATABASE IF NOT EXISTS magpie;

USE magpie;

CREATE TABLE `events` (
  `event_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `join_code` varchar(80) DEFAULT NULL,
  `view_code` varchar(80) DEFAULT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `settings` (
  `setting_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `value` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`setting_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `sharing` (
  `sharing_id` bigint NOT NULL AUTO_INCREMENT,
  `player_name` varchar(80) NOT NULL,
  `player_id` varchar(36) NOT NULL,
  `event_name` varchar(80) DEFAULT NULL,
  `state` text NOT NULL,
  `timestamp` decimal(23,3) NOT NULL,
  `player_no` int DEFAULT NULL,
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sharing_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;