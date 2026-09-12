import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';

type DbEnv = { DB: D1Database };
const db = () => (env as unknown as DbEnv).DB;

/** 登录后按账号读取，访客按设备读取，保证与错题本采用相同的同步规则。 */
async function ownerKey(deviceId: string | null) {
  const user = await getChatGPTUser();
  return user ? `account:${user.userId}` : deviceId;
}

export async function GET(request: Request) {
  const owner = await ownerKey(
    new URL(request.url).searchParams.get('deviceId'),
  );
  if (!owner)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  const result = await db()
    .prepare(`SELECT id, word, kana, meaning, usage,
    source_context AS sourceContext, created_at AS createdAt, updated_at AS updatedAt
    FROM vocabulary_entries WHERE device_id = ? ORDER BY updated_at DESC`)
    .bind(owner)
    .all();
  return Response.json(result.results);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    deviceId?: string;
    entry?: {
      id?: string;
      word?: string;
      kana?: string;
      meaning?: string;
      usage?: string;
      sourceContext?: string;
    };
  };
  const owner = await ownerKey(body.deviceId || null);
  const entry = body.entry;
  if (
    !owner ||
    !entry?.word?.trim() ||
    !entry.kana?.trim() ||
    !entry.meaning?.trim()
  )
    return Response.json({ error: 'incomplete entry' }, { status: 400 });
  const now = new Date().toISOString();
  const id = entry.id || crypto.randomUUID();
  await db()
    .prepare(`INSERT INTO vocabulary_entries
    (id, device_id, word, kana, meaning, usage, source_context, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(device_id, word) DO UPDATE SET kana=excluded.kana,
    meaning=excluded.meaning, usage=excluded.usage, source_context=excluded.source_context,
    updated_at=excluded.updated_at`)
    .bind(
      id,
      owner,
      entry.word.trim(),
      entry.kana.trim(),
      entry.meaning.trim(),
      entry.usage?.trim() || '',
      entry.sourceContext?.trim() || null,
      now,
      now,
    )
    .run();
  const saved = await db()
    .prepare(`SELECT id, word, kana, meaning, usage,
    source_context AS sourceContext, created_at AS createdAt, updated_at AS updatedAt
    FROM vocabulary_entries WHERE device_id = ? AND word = ?`)
    .bind(owner, entry.word.trim())
    .first();
  return Response.json(saved);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const owner = await ownerKey(url.searchParams.get('deviceId'));
  const id = url.searchParams.get('id');
  if (!owner || !id)
    return Response.json({ error: 'invalid request' }, { status: 400 });
  await db()
    .prepare('DELETE FROM vocabulary_entries WHERE device_id = ? AND id = ?')
    .bind(owner, id)
    .run();
  return Response.json({ ok: true });
}
