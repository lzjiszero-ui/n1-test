import { env } from 'cloudflare:workers';

type DbEnv = { DB: D1Database };
const db = () => (env as unknown as DbEnv).DB;

export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get('deviceId');
  if (!deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  const [attempts, profile, sessions] = await Promise.all([
    db().prepare(`SELECT question_id AS id, chosen, seconds, correct, mode,
      session_id AS sessionId, created_at AS createdAt FROM attempts
      WHERE device_id = ? ORDER BY created_at ASC LIMIT 3000`).bind(deviceId).all(),
    db().prepare(`SELECT exam_date AS examDate, daily_minutes AS dailyMinutes,
      target_score AS targetScore FROM study_profiles WHERE device_id = ?`).bind(deviceId).first(),
    db().prepare(`SELECT id, mode, total_questions AS totalQuestions,
      correct_questions AS correctQuestions, elapsed_seconds AS elapsedSeconds,
      completed_at AS completedAt FROM learning_sessions
      WHERE device_id = ? ORDER BY completed_at DESC LIMIT 100`).bind(deviceId).all(),
  ]);
  return Response.json({ attempts: attempts.results, profile, sessions: sessions.results });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    deviceId?: string;
    attempt?: { id: number; sessionId: string; module: string; type: string; mode: string; chosen: number; correct: boolean; seconds: number; createdAt?: string };
    profile?: { examDate: string; dailyMinutes: number; targetScore: number };
    session?: { id: string; mode: string; totalQuestions: number; correctQuestions: number; elapsedSeconds: number; completedAt?: string };
  };
  if (!body.deviceId)
    return Response.json({ error: 'deviceId is required' }, { status: 400 });
  const now = new Date().toISOString();
  if (body.attempt) {
    const a = body.attempt;
    await db().prepare(`INSERT INTO attempts
      (device_id, session_id, question_id, module, question_type, mode, chosen, correct, seconds, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(device_id, session_id, question_id) DO UPDATE SET
      chosen=excluded.chosen, correct=excluded.correct, seconds=excluded.seconds`).bind(
        body.deviceId, a.sessionId, a.id, a.module, a.type, a.mode, a.chosen,
        a.correct ? 1 : 0, a.seconds, a.createdAt || now,
      ).run();
  }
  if (body.profile) {
    const p = body.profile;
    await db().prepare(`INSERT INTO study_profiles
      (device_id, exam_date, daily_minutes, target_score, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(device_id) DO UPDATE SET exam_date=excluded.exam_date,
      daily_minutes=excluded.daily_minutes, target_score=excluded.target_score,
      updated_at=excluded.updated_at`).bind(body.deviceId, p.examDate, p.dailyMinutes, p.targetScore, now).run();
  }
  if (body.session) {
    const s = body.session;
    await db().prepare(`INSERT OR REPLACE INTO learning_sessions
      (id, device_id, mode, total_questions, correct_questions, elapsed_seconds, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(s.id, body.deviceId, s.mode, s.totalQuestions,
        s.correctQuestions, s.elapsedSeconds, s.completedAt || now).run();
  }
  return Response.json({ ok: true });
}
