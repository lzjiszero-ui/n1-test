import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const wrongAnswers = sqliteTable(
  'wrong_answers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    deviceId: text('device_id').notNull(),
    questionId: integer('question_id').notNull(),
    module: text('module').notNull(),
    questionType: text('question_type').notNull(),
    chosen: integer('chosen').notNull(),
    reason: text('reason').notNull().default('待分析'),
    mastered: integer('mastered', { mode: 'boolean' }).notNull().default(false),
    nextReview: text('next_review').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_wrong_answers_device_question').on(
      table.deviceId,
      table.questionId,
    ),
  ],
);
