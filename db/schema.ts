import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// 错题表的结构定义。每行代表某台设备保存的一道错题及其当前复习状态。
export const wrongAnswers = sqliteTable(
  'wrong_answers',
  {
    // 数据库内部使用的自增编号。
    id: integer('id').primaryKey({ autoIncrement: true }),
    // 浏览器设备标识，用来区分不同学习者的数据。
    deviceId: text('device_id').notNull(),
    // 题库中的原始题目编号。
    questionId: integer('question_id').notNull(),
    // 题目所属模块与题型，便于分类和统计。
    module: text('module').notNull(),
    questionType: text('question_type').notNull(),
    // 学习者最后一次选择的选项序号。
    chosen: integer('chosen').notNull(),
    // 错误原因、是否已掌握，以及计划中的下次复习日期。
    reason: text('reason').notNull().default('待分析'),
    mastered: integer('mastered', { mode: 'boolean' }).notNull().default(false),
    nextReview: text('next_review').notNull(),
    // 创建和最近更新时间使用 ISO 文本保存，方便同步与排序。
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    // 同一台设备、同一道题只能有一条错题记录，重复保存时会更新原记录。
    uniqueIndex('idx_wrong_answers_device_question').on(
      table.deviceId,
      table.questionId,
    ),
  ],
);
