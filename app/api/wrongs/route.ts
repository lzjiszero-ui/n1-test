import { env } from 'cloudflare:workers';

type DbEnv = { DB: D1Database };

// 取得 Cloudflare 提供的 D1 数据库连接，下面三个接口都会通过它读写错题。
const db = () => (env as unknown as DbEnv).DB;

// 读取某台设备保存的全部错题，并优先返回尚未掌握、最近更新的记录。
export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get('deviceId');
  if (!deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  const result = await db()
    .prepare(`SELECT question_id AS id, chosen, reason, mastered, next_review AS nextReview,
      review_stage AS reviewStage, review_count AS reviewCount, last_reviewed_at AS lastReviewedAt
      FROM wrong_answers WHERE device_id = ? ORDER BY mastered ASC, updated_at DESC`)
    .bind(deviceId)
    .all();
  return Response.json(result.results);
}
// 保存错题列表：已有题目会更新复习状态，新题目则会新增一条记录。
export async function POST(request: Request) {
  const body = (await request.json()) as {
    deviceId?: string;
    items?: Array<{
      id: number;
      module: string;
      type: string;
      chosen: number;
      reason: string;
      mastered: boolean;
      nextReview: string;
      reviewStage?: number;
      reviewCount?: number;
      lastReviewedAt?: string;
    }>;
  };
  if (!body.deviceId || !Array.isArray(body.items))
    return Response.json({ error: 'invalid payload' }, { status: 400 });
  const now = new Date().toISOString();
  if (body.items.length) {
    await db().batch(
      body.items.map((item) =>
        db()
          .prepare(`INSERT INTO wrong_answers
          (device_id, question_id, module, question_type, chosen, reason, mastered, next_review,
           review_stage, review_count, last_reviewed_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(device_id, question_id) DO UPDATE SET
          chosen=excluded.chosen, reason=excluded.reason, mastered=excluded.mastered,
          next_review=excluded.next_review, module=excluded.module,
          question_type=excluded.question_type, review_stage=excluded.review_stage,
          review_count=excluded.review_count, last_reviewed_at=excluded.last_reviewed_at,
          updated_at=excluded.updated_at`)
          .bind(
            body.deviceId,
            item.id,
            item.module,
            item.type,
            item.chosen,
            item.reason,
            item.mastered ? 1 : 0,
            item.nextReview,
            item.reviewStage || 0,
            item.reviewCount || 0,
            item.lastReviewedAt || null,
            now,
            now,
          ),
      ),
    );
  }
  return Response.json({ ok: true, count: body.items.length });
}

