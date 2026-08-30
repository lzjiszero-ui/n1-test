import {
  integer,
  index,
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
    reviewStage: integer('review_stage').notNull().default(0),
    reviewCount: integer('review_count').notNull().default(0),
    lastReviewedAt: text('last_reviewed_at'),
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

// 每次作答都独立保存，保留重复刷同一道题时的速度与正确率变化。
export const attempts = sqliteTable(
  'attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    deviceId: text('device_id').notNull(),
    sessionId: text('session_id').notNull(),
    questionId: integer('question_id').notNull(),
    module: text('module').notNull(),
    questionType: text('question_type').notNull(),
    mode: text('mode').notNull(),
    chosen: integer('chosen').notNull(),
    correct: integer('correct', { mode: 'boolean' }).notNull(),
    seconds: integer('seconds').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_attempts_device_session_question').on(
      table.deviceId,
      table.sessionId,
      table.questionId,
    ),
    index('idx_attempts_device_created').on(table.deviceId, table.createdAt),
  ],
);

// 保存考试日期和每日可学习时间，用于每天动态生成计划。
export const studyProfiles = sqliteTable('study_profiles', {
  deviceId: text('device_id').primaryKey(),
  examDate: text('exam_date').notNull(),
  dailyMinutes: integer('daily_minutes').notNull().default(30),
  targetScore: integer('target_score').notNull().default(120),
  updatedAt: text('updated_at').notNull(),
});

// 保存每一轮诊断、专项训练或模拟考试的汇总结果。
export const learningSessions = sqliteTable(
  'learning_sessions',
  {
    id: text('id').primaryKey(),
    deviceId: text('device_id').notNull(),
    mode: text('mode').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    correctQuestions: integer('correct_questions').notNull(),
    elapsedSeconds: integer('elapsed_seconds').notNull(),
    completedAt: text('completed_at').notNull(),
  },
  (table) => [index('idx_learning_sessions_device_completed').on(table.deviceId, table.completedAt)],
);
