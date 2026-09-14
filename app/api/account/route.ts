import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

type DbEnv = { DB: D1Database };
const db = () => (env as unknown as DbEnv).DB;
const accountKey = (userId: string) => `account:${userId}`;

/** 返回当前登录状态，页面据此显示账号或登录入口。 */
export async function GET() {
  const user = await getChatGPTUser();
  return Response.json(
    user ? { signedIn: true, email: user.email } : { signedIn: false },
  );
}

/**
 * 首次登录某台设备时，把该设备已经保存的内容并入账号。
 * “账号中较新的记录优先”可避免另一台设备的旧缓存覆盖最新学习状态。
 */
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return Response.json({ error: 'sign in required' }, { status: 401 });
  const body = (await request.json()) as { deviceId?: string };
  if (!body.deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });

  const target = accountKey(user.userId);
  // 旧版直接使用设备编号作为数据库键，保留这个格式才能找回并迁移历史数据。
  const source = body.deviceId;
  if (target !== source) {
    await db().batch([
      db()
        .prepare(`INSERT INTO wrong_answers
        (device_id, question_id, module, question_type, chosen, reason, mastered, next_review,
         review_stage, review_count, last_reviewed_at, created_at, updated_at)
        SELECT ?, question_id, module, question_type, chosen, reason, mastered, next_review,
         review_stage, review_count, last_reviewed_at, created_at, updated_at
        FROM wrong_answers WHERE device_id = ?
        ON CONFLICT(device_id, question_id) DO UPDATE SET
         module=excluded.module, question_type=excluded.question_type, chosen=excluded.chosen,
         reason=CASE WHEN excluded.updated_at > wrong_answers.updated_at THEN excluded.reason ELSE wrong_answers.reason END,
         mastered=MAX(wrong_answers.mastered, excluded.mastered),
         next_review=CASE WHEN excluded.updated_at > wrong_answers.updated_at THEN excluded.next_review ELSE wrong_answers.next_review END,
         review_stage=MAX(wrong_answers.review_stage, excluded.review_stage),
         review_count=MAX(wrong_answers.review_count, excluded.review_count),
         last_reviewed_at=CASE WHEN excluded.updated_at > wrong_answers.updated_at THEN excluded.last_reviewed_at ELSE wrong_answers.last_reviewed_at END,
         updated_at=MAX(wrong_answers.updated_at, excluded.updated_at)`)
        .bind(target, source),
      db()
        .prepare(`INSERT OR IGNORE INTO attempts
        (device_id, session_id, question_id, module, question_type, mode, chosen, correct, seconds, created_at)
        SELECT ?, session_id, question_id, module, question_type, mode, chosen, correct, seconds, created_at
        FROM attempts WHERE device_id = ?`)
        .bind(target, source),
      db()
        .prepare(`INSERT OR IGNORE INTO learning_sessions
        (id, device_id, mode, total_questions, correct_questions, elapsed_seconds, completed_at)
        SELECT lower(hex(randomblob(16))), ?, mode, total_questions, correct_questions, elapsed_seconds, completed_at
        FROM learning_sessions WHERE device_id = ?`)
        .bind(target, source),
      db()
        .prepare(`INSERT OR IGNORE INTO study_profiles
        (device_id, exam_date, daily_minutes, target_score, updated_at)
        SELECT ?, exam_date, daily_minutes, target_score, updated_at
        FROM study_profiles WHERE device_id = ?`)
        .bind(target, source),
      db()
        .prepare(`INSERT INTO vocabulary_entries
        (id, device_id, word, kana, meaning, usage, source_context, created_at, updated_at)
        SELECT lower(hex(randomblob(16))), ?, word, kana, meaning, usage, source_context, created_at, updated_at
        FROM vocabulary_entries WHERE device_id = ?
        ON CONFLICT(device_id, word) DO UPDATE SET kana=excluded.kana,
        meaning=excluded.meaning, usage=excluded.usage, source_context=excluded.source_context,
        updated_at=excluded.updated_at
        WHERE excluded.updated_at > vocabulary_entries.updated_at`)
        .bind(target, source),
    ]);
  }
  return Response.json({ signedIn: true, email: user.email });
}
