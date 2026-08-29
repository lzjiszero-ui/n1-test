import { env } from 'cloudflare:workers';

type DbEnv = { DB: D1Database };
const db = () => (env as unknown as DbEnv).DB;

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get('deviceId');
  if (!deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  const result = await db()
    .prepare(`SELECT question_id AS id, chosen, reason, mastered, next_review AS nextReview
      FROM wrong_answers WHERE device_id = ? ORDER BY mastered ASC, updated_at DESC`)
    .bind(deviceId)
    .all();
  return Response.json(result.results);
}

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
          (device_id, question_id, module, question_type, chosen, reason, mastered, next_review, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(device_id, question_id) DO UPDATE SET
          chosen=excluded.chosen, reason=excluded.reason, mastered=excluded.mastered,
          next_review=excluded.next_review, module=excluded.module,
          question_type=excluded.question_type, updated_at=excluded.updated_at`)
          .bind(
            body.deviceId,
            item.id,
            item.module,
            item.type,
            item.chosen,
            item.reason,
            item.mastered ? 1 : 0,
            item.nextReview,
            now,
            now,
          ),
      ),
    );
  }
  return Response.json({ ok: true, count: body.items.length });
}

export async function DELETE(request: Request) {
  const { deviceId } = (await request.json()) as { deviceId?: string };
  if (!deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  await db()
    .prepare('DELETE FROM wrong_answers WHERE device_id = ?')
    .bind(deviceId)
    .run();
  return Response.json({ ok: true });
}
