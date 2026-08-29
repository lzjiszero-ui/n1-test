'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  LayoutDashboard,
  NotebookPen,
  Play,
  RotateCcw,
  Target,
  TimerReset,
  Trophy,
  TrendingUp,
} from 'lucide-react';

type Module = '文字・語彙' | '文法' | '読解' | '聴解';
type Question = {
  id: number;
  module: Module;
  type: string;
  prompt: string;
  context?: string;
  options: string[];
  answer: number;
  explain: string;
  targetSec: number;
};
type Wrong = {
  id: number;
  chosen: number;
  reason: string;
  mastered: boolean;
  nextReview: string;
};
type Attempt = {
  id: number;
  chosen: number;
  seconds: number;
  correct: boolean;
};
const questions: Question[] = [
  {
    id: 1,
    module: '文字・語彙',
    type: '同义词辨析',
    prompt: 'この制度の利用を市民に（　）ため、広報活動を強化した。',
    options: ['催促する', '促す', '急かす', '追い込む'],
    answer: 1,
    explain:
      '「促す」表示推动、鼓励某人采取行动；「催促する」用于催对方完成已经约定或应该完成的事情。',
    targetSec: 45,
  },
  {
    id: 2,
    module: '文字・語彙',
    type: '语境词汇',
    prompt: '新技術の導入によって、生産性に（　）向上が見られた。',
    options: ['著しい', '険しい', '騒がしい', '乏しい'],
    answer: 0,
    explain: '「著しい向上」是固定且自然的搭配，表示程度显著。',
    targetSec: 40,
  },
  {
    id: 3,
    module: '文法',
    type: '逆接',
    prompt: '経験がない（　）、この仕事ができないとは限らない。',
    options: ['からといって', 'ものなら', 'ばかりに', 'ところを'],
    answer: 0,
    explain: '「～からといって～とは限らない」表示“不能仅因为……就断定……”。',
    targetSec: 50,
  },
  {
    id: 4,
    module: '文法',
    type: '接续与语气',
    prompt: '事情を知っている（　）、彼は何も話そうとしなかった。',
    options: ['にしては', 'ものの', 'につれて', 'あげく'],
    answer: 1,
    explain: '「～ものの」接普通形，表示承认前项事实后转折，书面语色彩较强。',
    targetSec: 50,
  },
  {
    id: 5,
    module: '読解',
    type: '指示词',
    context:
      '便利さを追求すること自体が悪いのではない。しかし、それによって考える時間まで失われるなら、私たちは一度立ち止まる必要がある。このことは、技術を拒むという意味ではない。',
    prompt: '「このこと」が指す内容として最も近いものはどれか。',
    options: [
      '便利さを全面否定すること',
      '技術の利用をやめること',
      '便利さが思考時間を奪う場合に再考すること',
      '考える時間を短くすること',
    ],
    answer: 2,
    explain:
      '直前句“一度立ち止まる必要がある”的具体内容，即便利性损害思考时间时应重新审视。',
    targetSec: 95,
  },
  {
    id: 6,
    module: '読解',
    type: '作者观点',
    context:
      '失敗を避ける仕組みは必要だ。だが、失敗の可能性を完全になくそうとすれば、新しい試みも生まれない。重要なのは失敗しないことではなく、失敗から何を学ぶかである。',
    prompt: '作者最想表达什么？',
    options: [
      '所有失败都值得鼓励',
      '应取消风险管理',
      '学习失败比完全避免失败更重要',
      '新尝试必然失败',
    ],
    answer: 2,
    explain: '末句是结论句，作者强调重点不是零失败，而是从失败中学习。',
    targetSec: 105,
  },
  {
    id: 7,
    module: '聴解',
    type: '要点理解',
    context:
      '女：会議の資料、今日中に印刷しますか。男：内容が一部変わるそうだから、部長の確認が終わってからにしよう。女：では、先に参加者の名簿を確認しておきます。',
    prompt: '女の人はまず何をしますか。',
    options: [
      '資料を印刷する',
      '部長に電話する',
      '内容を変更する',
      '参加者名簿を確認する',
    ],
    answer: 3,
    explain:
      '女性最后说「先に参加者の名簿を確認しておきます」，因此先确认名单。',
    targetSec: 65,
  },
  {
    id: 8,
    module: '聴解',
    type: '即时应答',
    prompt:
      '「明日の発表、延期になったんだって？」への最も自然な応答はどれか。',
    options: [
      'ええ、来週に変わったそうです',
      'いいえ、発表が上手ですね',
      'では、昨日にしましょう',
      '発表してもらいません',
    ],
    answer: 0,
    explain: '对传闻的确认，自然回应是肯定并补充延期后的时间。',
    targetSec: 35,
  },
];
const reasons = [
  '不认识单词',
  '语法不懂',
  '看错题目',
  '被选项迷惑',
  '阅读速度慢',
  '听力没听清',
  '时间不足',
  '粗心',
];
const nav = [
  [LayoutDashboard, '今日学习'],
  [Target, '诊断测试'],
  [BrainCircuit, '专项训练'],
  [NotebookPen, '错题本'],
  [Trophy, '分数模拟'],
  [TrendingUp, '学习数据'],
] as const;
const today = () => new Date().toISOString().slice(0, 10);
const later = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

async function saveWrongs(deviceId: string, wrongs: Wrong[]) {
  const items = wrongs.map((wrong) => {
    const question = questions.find((q) => q.id === wrong.id)!;
    return {
      ...wrong,
      module: question.module,
      type: question.type,
    };
  });
  const response = await fetch('/api/wrongs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId, items }),
  });
  if (!response.ok) throw new Error('failed to save wrong answers');
}

export default function Home() {
  const [active, setActive] = useState('今日学习');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [wrongs, setWrongs] = useState<Wrong[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    const hydrate = async () => {
      setAttempts(JSON.parse(localStorage.getItem('ippo-attempts') || '[]'));
      setDone(JSON.parse(localStorage.getItem('ippo-done') || '[]'));
      const localWrongs: Wrong[] = JSON.parse(
        localStorage.getItem('ippo-wrongs') || '[]',
      );
      let id = localStorage.getItem('ippo-device-id');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('ippo-device-id', id);
      }
      setDeviceId(id);
      try {
        if (localWrongs.length) {
          await saveWrongs(id, localWrongs);
        }
        const response = await fetch(
          `/api/wrongs?deviceId=${encodeURIComponent(id)}`,
        );
        if (!response.ok) throw new Error('database unavailable');
        setWrongs(await response.json());
        setDbReady(true);
      } catch {
        setWrongs(localWrongs);
      }
      setLoaded(true);
    };
    void hydrate();
  }, []);
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('ippo-attempts', JSON.stringify(attempts));
      localStorage.setItem('ippo-wrongs', JSON.stringify(wrongs));
      localStorage.setItem('ippo-done', JSON.stringify(done));
    }
  }, [attempts, wrongs, done, loaded]);
  useEffect(() => {
    if (dbReady && deviceId) void saveWrongs(deviceId, wrongs);
  }, [wrongs, deviceId, dbReady]);
  const stats = useMemo(() => {
    const by = (m: Module) => {
      const a = attempts.filter(
        (x) => questions.find((q) => q.id === x.id)?.module === m,
      );
      return a.length
        ? Math.round((a.filter((x) => x.correct).length / a.length) * 100)
        : 0;
    };
    const rates = (['文字・語彙', '文法', '読解', '聴解'] as Module[]).map(by);
    const total = attempts.length
      ? Math.round(
          (attempts.filter((x) => x.correct).length / attempts.length) * 100,
        )
      : 0;
    return {
      rates,
      total,
      score: attempts.length ? Math.round(total * 1.8) : null,
      avg: attempts.length
        ? Math.round(
            attempts.reduce((s, x) => s + x.seconds, 0) / attempts.length,
          )
        : 0,
    };
  }, [attempts]);
  const submit = (a: Attempt) => {
    setAttempts((p) => [...p.filter((x) => x.id !== a.id), a]);
    if (!a.correct && !wrongs.some((w) => w.id === a.id))
      setWrongs((p) => [
        ...p,
        {
          id: a.id,
          chosen: a.chosen,
          reason: '待分析',
          mastered: false,
          nextReview: later(1),
        },
      ]);
  };
  const reset = async () => {
    if (confirm('确定清除本机的学习记录并重新开始吗？')) {
      if (deviceId)
        await fetch('/api/wrongs', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        });
      setAttempts([]);
      setWrongs([]);
      setDone([]);
    }
  };
  return (
    <main className="real-shell">
      <aside className="real-side">
        <div className="brand">
          <span className="brand-mark">一</span>
          <div>
            <b>一歩 N1</b>
            <small>数据保存在此设备</small>
          </div>
        </div>
        <nav>
          {nav.map(([Icon, label]) => (
            <button
              key={label}
              className={active === label ? 'active' : ''}
              onClick={() => setActive(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === '错题本' &&
                wrongs.filter((w) => !w.mastered).length > 0 && (
                  <em>{wrongs.filter((w) => !w.mastered).length}</em>
                )}
            </button>
          ))}
        </nav>
        <div className="privacy">
          <b>{dbReady ? '数据库已连接' : '离线备用模式'}</b>
          <p>
            {dbReady
              ? '错题已同步到站点数据库；学习进度仍保存在当前设备。'
              : '数据库暂时不可用，错题会先保存在当前设备。'}
          </p>
          <button onClick={reset}>
            <RotateCcw size={13} /> 清除记录
          </button>
        </div>
      </aside>
      <section className="real-content">
        <header className="real-top">
          <b>一歩 N1</b>
          <span>
            <Flame size={17} /> 今天已完成 {done.length} 项
          </span>
        </header>
        {active === '今日学习' && (
          <Dashboard
            stats={stats}
            done={done}
            setDone={setDone}
            go={setActive}
            wrongCount={wrongs.filter((w) => !w.mastered).length}
          />
        )}{' '}
        {active === '诊断测试' && (
          <Quiz mode="diagnostic" attempts={attempts} onSubmit={submit} />
        )}{' '}
        {active === '专项训练' && (
          <Quiz mode="practice" attempts={attempts} onSubmit={submit} />
        )}{' '}
        {active === '错题本' && (
          <WrongBook wrongs={wrongs} setWrongs={setWrongs} />
        )}{' '}
        {active === '分数模拟' && (
          <Score stats={stats} attempts={attempts} go={setActive} />
        )}{' '}
        {active === '学习数据' && (
          <Data stats={stats} attempts={attempts} wrongs={wrongs} />
        )}
      </section>
    </main>
  );
}

function Dashboard({
  stats,
  done,
  setDone,
  go,
  wrongCount,
}: {
  stats: any;
  done: string[];
  setDone: (x: string[]) => void;
  go: (x: string) => void;
  wrongCount: number;
}) {
  const tasks = [
    ['词汇辨析', '完成 2 道近义词题', '专项训练'],
    ['语法训练', '完成 2 道接续题', '专项训练'],
    ['阅读限时', '完成 1 篇短文', '专项训练'],
    ['到期错题', `${wrongCount} 道需要复习`, '错题本'],
  ];
  const score = stats.score;
  return (
    <div className="workspace">
      <div className="hero-row">
        <div>
          <span className="kicker">今日学习</span>
          <h1>
            {score === null
              ? '先做一次诊断，建立你的真实起点。'
              : '继续保持，今天也向合格靠近一步。'}
          </h1>
          <p>
            {score === null
              ? '8 道分模块题目，系统会同时记录正确率与作答速度。'
              : `目前已记录 ${stats.rates.filter((x: number) => x > 0).length} 个模块的数据，所有结果来自你的真实作答。`}
          </p>
        </div>
        <button
          className="solid"
          onClick={() => go(score === null ? '诊断测试' : '专项训练')}
        >
          <Play size={16} />
          {score === null ? '开始诊断' : '开始训练'}
        </button>
      </div>
      <div className="real-score">
        <div>
          <span>基于真实作答的预计分</span>
          <b>
            {score ?? '—'}
            <small>/180</small>
          </b>
          <p>
            {score === null
              ? '完成诊断后生成'
              : score >= 100
                ? '当前达到总分线'
                : '距离 100 分合格线还差 ' + (100 - score) + ' 分'}
          </p>
        </div>
        {(['文字・語彙', '文法', '読解', '聴解'] as Module[]).map((m, i) => (
          <div className="metric" key={m}>
            <span>{m}</span>
            <b>
              {stats.rates[i] || '—'}
              {stats.rates[i] > 0 && <small>%</small>}
            </b>
            <div>
              <i style={{ width: `${stats.rates[i]}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <section className="white-card">
          <div className="card-head">
            <div>
              <span className="kicker">DAILY PLAN</span>
              <h2>今天的学习清单</h2>
            </div>
            <b>{done.length}/4</b>
          </div>
          {tasks.map(([name, sub, dest]) => (
            <button
              className={
                done.includes(name) ? 'real-task checked' : 'real-task'
              }
              key={name}
              onClick={() => {
                if (!done.includes(name)) go(dest);
              }}
            >
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDone(
                    done.includes(name)
                      ? done.filter((x) => x !== name)
                      : [...done, name],
                  );
                }}
              >
                {done.includes(name) && <Check size={14} />}
              </span>
              <div>
                <b>{name}</b>
                <small>{sub}</small>
              </div>
              <ChevronRight size={16} />
            </button>
          ))}
        </section>
        <section className="white-card">
          <div className="card-head">
            <div>
              <span className="kicker">NEXT ACTION</span>
              <h2>系统建议</h2>
            </div>
          </div>
          {stats.score === null ? (
            <Empty
              text="目前没有足够数据"
              sub="完成诊断后，这里会根据正确率和速度给出建议。"
            />
          ) : (
            <div className="advice">
              <Target size={26} />
              <b>
                {stats.rates[2] < 70 ? '优先提高阅读正确率' : '进入限时训练'}
              </b>
              <p>
                {stats.avg > 75
                  ? `平均每题 ${stats.avg} 秒，速度仍有提升空间。`
                  : '当前速度稳定，下一步应加强易混选项判断。'}
              </p>
              <button onClick={() => go('专项训练')}>去训练</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Quiz({
  mode,
  attempts,
  onSubmit,
}: {
  mode: string;
  attempts: Attempt[];
  onSubmit: (a: Attempt) => void;
}) {
  const [practiceModule, setPracticeModule] = useState<Module>('文字・語彙');
  const pool =
    mode === 'diagnostic'
      ? questions
      : questions.filter((q) => q.module === practiceModule);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [start, setStart] = useState(Date.now());
  const q = pool[index];
  const doneCount = pool.filter((x) =>
    attempts.some((a) => a.id === x.id),
  ).length;
  const answer = () => {
    if (chosen === null) return;
    const seconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    onSubmit({ id: q.id, chosen, seconds, correct: chosen === q.answer });
    setChecked(true);
  };
  const next = () => {
    setIndex((index + 1) % pool.length);
    setChosen(null);
    setChecked(false);
    setStart(Date.now());
  };
  return (
    <div className="workspace">
      <div className="quiz-head">
        <div>
          <span className="kicker">
            {mode === 'diagnostic' ? '入学诊断' : '专项训练'}
          </span>
          <h1>
            {mode === 'diagnostic'
              ? '8 道真实题目 · 自动计时判分'
              : `${practiceModule}专项训练`}
          </h1>
          <p>
            已完成 {doneCount}/{pool.length} · 重新作答会更新该题记录
          </p>
        </div>
        <div className="live-time">
          <Clock3 size={18} /> 目标 {q.targetSec} 秒
        </div>
      </div>
      {mode === 'practice' && (
        <div className="practice-modules" aria-label="专项训练分类">
          {(['文字・語彙', '文法', '読解', '聴解'] as Module[]).map(
            (module) => {
              const moduleQuestions = questions.filter(
                (q) => q.module === module,
              );
              const completed = moduleQuestions.filter((question) =>
                attempts.some((attempt) => attempt.id === question.id),
              ).length;
              return (
                <button
                  key={module}
                  className={practiceModule === module ? 'active' : ''}
                  onClick={() => {
                    setPracticeModule(module);
                    setIndex(0);
                    setChosen(null);
                    setChecked(false);
                    setStart(Date.now());
                  }}
                >
                  <span>
                    {module === '文字・語彙' && <BookOpen size={18} />}
                    {module === '文法' && <BrainCircuit size={18} />}
                    {module === '読解' && <NotebookPen size={18} />}
                    {module === '聴解' && <Headphones size={18} />}
                  </span>
                  <div>
                    <b>{module}</b>
                    <small>
                      已完成 {completed}/{moduleQuestions.length} 题
                    </small>
                  </div>
                </button>
              );
            },
          )}
        </div>
      )}
      <div className="quiz-layout">
        <section className="question-card">
          <div className="q-meta">
            <span>{q.module}</span>
            <b>{q.type}</b>
            <em>
              第 {index + 1}/{pool.length} 题
            </em>
          </div>
          {q.context && <div className="passage">{q.context}</div>}
          <h2>{q.prompt}</h2>
          <div className="answer-options">
            {q.options.map((o, i) => (
              <button
                disabled={checked}
                key={o}
                onClick={() => setChosen(i)}
                className={`${chosen === i ? 'chosen ' : ''}${checked && i === q.answer ? 'correct ' : ''}${checked && chosen === i && i !== q.answer ? 'wrong' : ''}`}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            ))}
          </div>
          {checked && (
            <div
              className={chosen === q.answer ? 'feedback good' : 'feedback bad'}
            >
              <b>{chosen === q.answer ? '回答正确' : '回答错误'}</b>
              <p>{q.explain}</p>
            </div>
          )}
          <div className="q-actions">
            <button className="ghost" onClick={next}>
              跳过 / 下一题
            </button>
            {checked ? (
              <button className="solid" onClick={next}>
                下一题 <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="solid"
                disabled={chosen === null}
                onClick={answer}
              >
                提交答案
              </button>
            )}
          </div>
        </section>
        <aside className="session-card">
          <h3>本轮进度</h3>
          {pool.map((item, i) => {
            const a = attempts.find((x) => x.id === item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIndex(i);
                  setChosen(null);
                  setChecked(false);
                  setStart(Date.now());
                }}
                className={i === index ? 'current' : ''}
              >
                <span>{i + 1}</span>
                <div>
                  <b>{item.module}</b>
                  <small>{item.type}</small>
                </div>
                {a && (
                  <em className={a.correct ? 'ok' : 'no'}>
                    {a.correct ? '✓' : '×'}
                  </em>
                )}
              </button>
            );
          })}
          <p>
            {q.module === '聴解'
              ? '听解题当前使用文字稿模拟。真实音频与录音识别尚未接入。'
              : '切换分类不会丢失进度；重新作答会更新该题的统计结果。'}
          </p>
        </aside>
      </div>
    </div>
  );
}

function WrongBook({
  wrongs,
  setWrongs,
}: {
  wrongs: Wrong[];
  setWrongs: (x: Wrong[]) => void;
}) {
  const [statusFilter, setStatusFilter] = useState('全部');
  const [moduleFilter, setModuleFilter] = useState('全部');
  const update = (id: number, patch: Partial<Wrong>) =>
    setWrongs(wrongs.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const filtered = wrongs.filter((wrong) => {
    const question = questions.find((q) => q.id === wrong.id)!;
    const statusOk =
      statusFilter === '全部' ||
      (statusFilter === '已掌握' ? wrong.mastered : !wrong.mastered);
    return (
      statusOk && (moduleFilter === '全部' || question.module === moduleFilter)
    );
  });
  return (
    <div className="workspace">
      <div className="simple-title">
        <span className="kicker">自动收集</span>
        <h1>错题本</h1>
        <p>每次答错都会自动加入；请补充错误原因，系统会安排复习日期。</p>
      </div>
      <div className="wrong-filters">
        <div>
          <b>掌握状态</b>
          {['全部', '未掌握', '已掌握'].map((filter) => (
            <button
              key={filter}
              className={statusFilter === filter ? 'active' : ''}
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
              <span>
                {filter === '全部'
                  ? wrongs.length
                  : wrongs.filter((w) =>
                      filter === '已掌握' ? w.mastered : !w.mastered,
                    ).length}
              </span>
            </button>
          ))}
        </div>
        <div>
          <b>题目分类</b>
          {(['全部', '文字・語彙', '文法', '読解', '聴解'] as const).map(
            (filter) => (
              <button
                key={filter}
                className={moduleFilter === filter ? 'active' : ''}
                onClick={() => setModuleFilter(filter)}
              >
                {filter}
              </button>
            ),
          )}
        </div>
      </div>
      {wrongs.length === 0 ? (
        <Empty
          text="还没有错题"
          sub="去完成诊断或专项训练，答错的题会自动出现在这里。"
        />
      ) : filtered.length === 0 ? (
        <Empty text="没有符合条件的错题" sub="换一个掌握状态或题目分类看看。" />
      ) : (
        <div className="wrong-grid">
          {filtered.map((w) => {
            const q = questions.find((x) => x.id === w.id)!;
            return (
              <article
                className={`wrong-real ${w.mastered ? 'mastered' : ''}`}
                key={w.id}
              >
                <div className="q-meta">
                  <span>{q.module}</span>
                  <b>{q.type}</b>
                  <em>
                    {w.mastered
                      ? '已掌握'
                      : w.nextReview <= today()
                        ? '今天复习'
                        : w.nextReview + ' 复习'}
                  </em>
                </div>
                <h3>{q.prompt}</h3>
                <div className="compare">
                  <p>
                    <small>你的答案</small>
                    <b>{q.options[w.chosen]}</b>
                  </p>
                  <p>
                    <small>正确答案</small>
                    <b>{q.options[q.answer]}</b>
                  </p>
                </div>
                <p className="explain">{q.explain}</p>
                <label>
                  错误原因
                  <select
                    value={w.reason}
                    onChange={(e) =>
                      update(w.id, {
                        reason: e.target.value,
                        nextReview: later(2),
                      })
                    }
                  >
                    <option>待分析</option>
                    {reasons.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="master"
                  onClick={() =>
                    update(w.id, {
                      mastered: !w.mastered,
                      nextReview: later(w.mastered ? 1 : 7),
                    })
                  }
                >
                  {w.mastered ? '重新加入复习' : '✓ 标记已掌握'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Score({
  stats,
  attempts,
  go,
}: {
  stats: any;
  attempts: Attempt[];
  go: (x: string) => void;
}) {
  const modules = [
    ['语言知识', Math.round(((stats.rates[0] + stats.rates[1]) / 2) * 0.6)],
    ['阅读', Math.round(stats.rates[2] * 0.6)],
    ['听力', Math.round(stats.rates[3] * 0.6)],
  ];
  const enough = attempts.length >= 6;
  const total = modules.reduce((s, x) => s + Number(x[1]), 0);
  return (
    <div className="workspace">
      <div className="simple-title">
        <span className="kicker">按答题正确率线性估算</span>
        <h1>N1 分数模拟</h1>
        <p>
          这不是 JLPT
          官方换算分，仅用于观察学习趋势；题量不足时不会伪装成可靠预测。
        </p>
      </div>
      {!enough ? (
        <Empty
          text={`还差 ${6 - attempts.length} 道作答才能估算`}
          sub="至少完成 6 道不同模块的题目后生成分数区间。"
        >
          <button className="solid" onClick={() => go('诊断测试')}>
            继续诊断
          </button>
        </Empty>
      ) : (
        <>
          <div className="score-real">
            <div>
              <span>当前估算</span>
              <b>
                {total}
                <small>/180</small>
              </b>
              <em>
                {total >= 100
                  ? '总分达到合格线'
                  : '距离合格线 ' + (100 - total) + ' 分'}
              </em>
            </div>
            {modules.map(([n, s]) => (
              <div key={String(n)}>
                <span>{n}</span>
                <b>
                  {s}
                  <small>/60</small>
                </b>
                <div>
                  <i style={{ width: `${(Number(s) / 60) * 100}%` }} />
                </div>
                <em className={Number(s) >= 19 ? 'safe' : 'danger'}>
                  {Number(s) >= 19 ? '高于单科线' : '低于单科 19 分'}
                </em>
              </div>
            ))}
          </div>
          <div className="risk-real">
            <b>
              {modules.some((x) => Number(x[1]) < 19)
                ? '⚠ 存在单科不合格风险'
                : '✓ 当前无单科线风险'}
            </b>
            <p>
              总分达到 100 仍不等于合格：语言知识、阅读、听力每科都必须达到 19
              分。
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Data({
  stats,
  attempts,
  wrongs,
}: {
  stats: any;
  attempts: Attempt[];
  wrongs: Wrong[];
}) {
  const moduleNames: Module[] = ['文字・語彙', '文法', '読解', '聴解'];
  return (
    <div className="workspace">
      <div className="simple-title">
        <span className="kicker">只展示真实记录</span>
        <h1>学习数据</h1>
        <p>
          共完成 {attempts.length} 道题，记录 {wrongs.length} 道错题。
        </p>
      </div>
      {attempts.length === 0 ? (
        <Empty
          text="暂无学习数据"
          sub="完成第一道题后，这里会开始生成正确率和速度统计。"
        />
      ) : (
        <div className="data-real">
          <section className="white-card">
            <h2>各模块表现</h2>
            {moduleNames.map((m, i) => {
              const rows = attempts.filter(
                (a) => questions.find((q) => q.id === a.id)?.module === m,
              );
              const avg = rows.length
                ? Math.round(
                    rows.reduce((s, x) => s + x.seconds, 0) / rows.length,
                  )
                : 0;
              return (
                <div className="module-row" key={m}>
                  <b>{m}</b>
                  <div>
                    <i style={{ width: `${stats.rates[i]}%` }} />
                  </div>
                  <span>
                    {rows.length
                      ? `${stats.rates[i]}% · 平均 ${avg} 秒`
                      : '未作答'}
                  </span>
                </div>
              );
            })}
          </section>
          <section className="white-card">
            <h2>错误原因</h2>
            {reasons.map((r) => {
              const n = wrongs.filter((w) => w.reason === r).length;
              return (
                n > 0 && (
                  <div className="reason-row" key={r}>
                    <span>{r}</span>
                    <b>{n} 次</b>
                  </div>
                )
              );
            })}
            <p className="note">
              仍有 {wrongs.filter((w) => w.reason === '待分析').length}{' '}
              道错题未选择错误原因。
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function Empty({
  text,
  sub,
  children,
}: {
  text: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-real">
      <Target size={30} />
      <b>{text}</b>
      <p>{sub}</p>
      {children}
    </div>
  );
}
