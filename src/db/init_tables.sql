CREATE table IF NOT EXISTS `posts` (
  `id` BIGINT,
  `comments` INTEGER ,
  `likes` INTEGER ,
  `author_id` BIGINT,
  `date` DATETIME,
  `text` TEXT ,
  PRIMARY KEY (`id`)
);

CREATE table IF NOT EXISTS `comments` (
  `id` BIGINT,
  `from_id` BIGINT,
  `post_id` BIGINT,
  `date` DATETIME,
  `text` TEXT,
   `likes` INTEGER ,
  PRIMARY KEY (`id`)
);