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
  Moon,
  Square,
  Sun,
  Target,
  TimerReset,
  Trophy,
  TrendingUp,
  Volume2,
} from 'lucide-react';
import importedWrongQuestions from '@/lib/imported-wrongs.json';

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
  answerText?: string;
  answerRaw?: string;
  distractorExplain?: string;
  expansion?: string;
  translation?: string;
  source?: string;
  sourceQuestion?: string;
  frequency?: number;
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
const practiceQuestions: Question[] = [
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
const expandNumberedOptions = (items: string[]) => {
  if (items.length >= 3) return items.map((item) => item.trim());
  const expanded = items.flatMap((item) =>
    item
      .split(/[\s　]+[2-4][.．、:：][\s　]*/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
  return expanded.length > items.length ? expanded : items;
};
const questions: Question[] = [
  ...practiceQuestions,
  ...(importedWrongQuestions as unknown as Question[]).map((question) => {
    const rawOptions = question.prompt
      ? question.options
      : question.options.slice(1);
    return {
      ...question,
      prompt: question.prompt || question.options[0],
      options: expandNumberedOptions(rawOptions),
      answer: question.answer,
      targetSec: 60,
    };
  }),
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

const voiceQualityScore = (voice: SpeechSynthesisVoice) => {
  const name = voice.name.toLowerCase();
  let score = voice.lang.toLowerCase().startsWith('ja') ? 100 : 0;
  if (/natural|neural|premium|enhanced/.test(name)) score += 40;
  if (/nanami|keita|haruka|google.*日本語|google.*japanese/.test(name))
    score += 30;
  if (/microsoft|google|apple/.test(name)) score += 10;
  if (voice.localService) score += 3;
  return score;
};

const rankJapaneseVoices = (voices: SpeechSynthesisVoice[]) =>
  voices
    .filter((voice) => voice.lang.toLowerCase().startsWith('ja'))
    .sort((a, b) => voiceQualityScore(b) - voiceQualityScore(a));

const readingFocusTerm = (question: Question) => {
  if (question.type !== '漢字の読み方') return null;
  const correctLine = question.explain
    .split('\n')
    .find((line) => line.trim().startsWith(`${question.answerRaw}：`));
  if (correctLine) {
    const lineCandidates = [
      ...correctLine.matchAll(/[\p{Script=Han}々]+[\p{Script=Hiragana}]*/gu),
    ]
      .map((match) => match[0])
      .filter((candidate) => question.prompt.includes(candidate))
      .sort((a, b) => b.length - a.length);
    if (lineCandidates[0]) return lineCandidates[0];
  }
  const source = `${question.answerText || ''}\n${question.explain}`;
  const candidates = [
    ...[
      ...source.matchAll(
        /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々]+)[（(][ぁ-んァ-ヶー]+/gu,
      ),
    ].map((match) => match[1]),
    ...[...source.matchAll(/「([^」]+)」/g)].map((match) => match[1]),
  ];
  return (
    candidates
      .filter((candidate) => question.prompt.includes(candidate))
      .sort((a, b) => b.length - a.length)[0] || null
  );
};

const originalQuestionLabel = (question: Question) => {
  if (!question.sourceQuestion) return null;
  return /^\d+$/.test(question.sourceQuestion)
    ? `第 ${question.sourceQuestion} 题`
    : question.sourceQuestion;
};

const displayPrompt = (question: Question) => {
  if (!question.sourceQuestion || /^\d+$/.test(question.sourceQuestion))
    return question.prompt;
  return question.prompt.replace(
    new RegExp(
      `^${question.sourceQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[.．]\\s*`,
    ),
    '',
  );
};

const inflectedSurface = (term: string, text: string) => {
  if (text.includes(term)) return term;
  if (term.length < 2) return null;
  const stem = term.slice(0, -1);
  const endings: Record<string, string> = {
    い: '(?:く(?:て|ない|なって|なる)?|かった|ければ|さ|い)',
    う: '(?:って|った|わ|い|う)',
    く: '(?:いて|いた|か|き|く|けば)',
    ぐ: '(?:いで|いだ|が|ぎ|ぐ|げば)',
    す: '(?:して|した|さ|し|す|せば)',
    つ: '(?:って|った|た|ち|つ|てば)',
    ぬ: '(?:んで|んだ|な|に|ぬ|ねば)',
    ぶ: '(?:んで|んだ|ば|び|ぶ|べば)',
    む: '(?:んで|んだ|ま|み|む|めば)',
    る: '(?:って|った|られ|れば|ろ|ない|そう|て|た|り|る)',
  };
  const ending = endings[term.slice(-1)];
  if (!ending) return text.includes(stem) ? stem : null;
  return text.match(new RegExp(`${stem}${ending}`))?.[0] || null;
};

const synonymFocusSurface = (question: Question) => {
  if (question.type !== '言い換え類義') return null;
  const overrides: Record<number, string> = {
    10026: 'おろそか',
    10027: '請け負う',
    10052: 'しきたり',
  };
  const override = overrides[question.id];
  if (override) return inflectedSurface(override, question.prompt);
  const quoted = [...question.explain.matchAll(/「([^」]+)」/g)]
    .map((match) => inflectedSurface(match[1], question.prompt))
    .filter((candidate): candidate is string => Boolean(candidate))
    .sort((a, b) => b.length - a.length)[0];
  if (quoted) return quoted;
  const answer = question.answerText || '';
  if (!answer || /^正确/.test(answer)) return null;
  let prefix = 0;
  while (
    prefix < question.prompt.length &&
    prefix < answer.length &&
    question.prompt[prefix] === answer[prefix]
  )
    prefix += 1;
  let suffix = 0;
  while (
    suffix < question.prompt.length - prefix &&
    suffix < answer.length - prefix &&
    question.prompt[question.prompt.length - 1 - suffix] ===
      answer[answer.length - 1 - suffix]
  )
    suffix += 1;
  return question.prompt
    .slice(prefix, question.prompt.length - suffix)
    .trim()
    .replace(/^[、。\s]+|[、。\s]+$/g, '');
};

const markedPrompt = (question: Question) => {
  const focus = readingFocusTerm(question) || synonymFocusSurface(question);
  const prompt = displayPrompt(question);
  if (!focus) return prompt;
  const start = prompt.indexOf(focus);
  return (
    <>
      {prompt.slice(0, start)}
      <span className="reading-focus">{focus}</span>
      {prompt.slice(start + focus.length)}
    </>
  );
};

const usageFocusSurface = (question: Question, option: string) => {
  if (question.type !== '用法') return null;
  return inflectedSurface(question.prompt.trim(), option);
};

const markedOption = (question: Question, option: string) => {
  const focus = usageFocusSurface(question, option);
  if (!focus) return option;
  const start = option.indexOf(focus);
  return (
    <>
      {option.slice(0, start)}
      <span className="option-focus">{focus}</span>
      {option.slice(start + focus.length)}
    </>
  );
};

const optionLayoutClass = (question: Question) => {
  const lengths = question.options.map((option) => option.trim().length);
  const longest = Math.max(...lengths, 0);
  const average = lengths.length
    ? lengths.reduce((sum, length) => sum + length, 0) / lengths.length
    : 0;
  if (
    question.options.some((option) => /[。！？!?]/.test(option.trim())) ||
    average >= 18 ||
    longest >= 28
  )
    return 'sentence-options';
  if (longest >= 11 || average >= 9) return 'balanced-options';
  return 'compact-options';
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
  for (let start = 0; start < items.length; start += 50) {
    const response = await fetch('/api/wrongs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deviceId, items: items.slice(start, start + 50) }),
    });
    if (!response.ok) throw new Error('failed to save wrong answers');
  }
}

const importedWrongs = (): Wrong[] =>
  importedWrongQuestions.map((question) => ({
    id: question.id,
    chosen: -1,
    reason: '待分析',
    mastered: false,
    nextReview: today(),
  }));

export default function Home() {
  const [active, setActive] = useState('今日学习');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [wrongs, setWrongs] = useState<Wrong[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [dbReady, setDbReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    const stored = localStorage.getItem('ippo-theme');
    const initial =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('ippo-theme', next);
  };
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
        let hydrated: Wrong[] = await response.json();
        if (!localStorage.getItem('ippo-imported-v2')) {
          const merged = new Map(hydrated.map((wrong) => [wrong.id, wrong]));
          importedWrongs().forEach((wrong) => {
            if (!merged.has(wrong.id)) merged.set(wrong.id, wrong);
          });
          hydrated = [...merged.values()];
          await saveWrongs(id, hydrated);
          localStorage.setItem('ippo-imported-v2', '1');
        }
        setWrongs(hydrated);
        setDbReady(true);
      } catch {
        if (!localStorage.getItem('ippo-imported-v2')) {
          const merged = new Map(localWrongs.map((wrong) => [wrong.id, wrong]));
          importedWrongs().forEach((wrong) => {
            if (!merged.has(wrong.id)) merged.set(wrong.id, wrong);
          });
          setWrongs([...merged.values()]);
          localStorage.setItem('ippo-imported-v2', '1');
        } else {
          setWrongs(localWrongs);
        }
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
          <div className="top-actions">
            <span>
              <Flame size={17} /> 今天已完成 {done.length} 项
            </span>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
              }
              title={theme === 'dark' ? '浅色模式' : '深色模式'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
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
  const [sessionSeed, setSessionSeed] = useState(() => Date.now());
  const [generation, setGeneration] = useState(1);
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, Attempt>>(
    {},
  );
  const pool = useMemo(() => {
    const source =
      mode === 'diagnostic'
        ? practiceQuestions
        : practiceQuestions.filter((q) => q.module === practiceModule);
    if (source.length < 2) return source;
    const offset = Math.abs(Math.floor(sessionSeed)) % source.length;
    return [...source.slice(offset), ...source.slice(0, offset)];
  }, [mode, practiceModule, sessionSeed]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [start, setStart] = useState(Date.now());
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speaking, setSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voiceUri, setVoiceUri] = useState('');
  const q = pool[index];
  const doneCount = pool.filter((x) => sessionAnswers[x.id]).length;
  const japaneseVoices = useMemo(
    () => rankJapaneseVoices(availableVoices),
    [availableVoices],
  );
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const preferred = rankJapaneseVoices(voices)[0];
      if (preferred) setVoiceUri((current) => current || preferred.voiceURI);
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);
  const resetSession = () => {
    setSessionSeed((seed) => seed + 1);
    setGeneration((value) => value + 1);
    setSessionAnswers({});
    setIndex(0);
    setChosen(null);
    setChecked(false);
    setShowTranscript(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setStart(Date.now());
  };
  const playListening = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const quoted = q.prompt.match(/「([^」]+)」/)?.[1];
    const selectedVoice =
      japaneseVoices.find((voice) => voice.voiceURI === voiceUri) ||
      japaneseVoices[0];
    const alternateVoice = japaneseVoices.find(
      (voice) => voice.voiceURI !== selectedVoice?.voiceURI,
    );
    const dialogue = q.context
      ? [...q.context.matchAll(/([男女])：([\s\S]*?)(?=(?:女|男)：|$)/g)].map(
          (match) => ({ speaker: match[1], text: match[2].trim() }),
        )
      : [];
    const segments = dialogue.length
      ? dialogue
      : [{ speaker: '女', text: quoted || q.context || q.prompt }];
    const utterances = segments.map(({ speaker, text }) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.voice =
        speaker === '男' && alternateVoice
          ? alternateVoice
          : selectedVoice || null;
      utterance.rate = speechRate;
      utterance.pitch = speaker === '男' ? 0.94 : 1.03;
      utterance.volume = 1;
      return utterance;
    });
    const finish = () => setSpeaking(false);
    utterances.at(-1)!.onend = finish;
    utterances.forEach((utterance) => {
      utterance.onerror = finish;
    });
    setSpeaking(true);
    utterances.forEach((utterance) => window.speechSynthesis.speak(utterance));
  };
  const answer = () => {
    if (chosen === null) return;
    const seconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    const result = {
      id: q.id,
      chosen,
      seconds,
      correct: chosen === q.answer,
    };
    onSubmit(result);
    setSessionAnswers((current) => ({ ...current, [q.id]: result }));
    setChecked(true);
  };
  const next = () => {
    setIndex((index + 1) % pool.length);
    setChosen(null);
    setChecked(false);
    setShowTranscript(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
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
            第 {generation} 组 · 已完成 {doneCount}/{pool.length} ·
            重新生成会重置本轮状态
          </p>
        </div>
        <div className="quiz-tools">
          {mode === 'practice' && (
            <button className="regenerate" onClick={resetSession}>
              <RotateCcw size={15} /> 重新生成一组
            </button>
          )}
          <div className="live-time">
            <Clock3 size={18} /> 目标 {q.targetSec} 秒
          </div>
        </div>
      </div>
      {mode === 'practice' && (
        <div className="practice-modules" aria-label="专项训练分类">
          {(['文字・語彙', '文法', '読解', '聴解'] as Module[]).map(
            (module) => {
              const moduleQuestions = questions.filter(
                (q) => q.module === module,
              );
              const completed =
                module === practiceModule
                  ? moduleQuestions.filter(
                      (question) => sessionAnswers[question.id],
                    ).length
                  : 0;
              return (
                <button
                  key={module}
                  className={practiceModule === module ? 'active' : ''}
                  onClick={() => {
                    setPracticeModule(module);
                    setSessionSeed((seed) => seed + 1);
                    setGeneration((value) => value + 1);
                    setSessionAnswers({});
                    setIndex(0);
                    setChosen(null);
                    setChecked(false);
                    setShowTranscript(false);
                    window.speechSynthesis?.cancel();
                    setSpeaking(false);
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
          {q.module === '聴解' && (
            <div className="listening-player">
              <div className="listen-main">
                <button
                  className="audio-play"
                  onClick={
                    speaking
                      ? () => {
                          window.speechSynthesis.cancel();
                          setSpeaking(false);
                        }
                      : playListening
                  }
                >
                  {speaking ? (
                    <Square size={17} fill="currentColor" />
                  ) : (
                    <Volume2 size={19} />
                  )}
                  {speaking ? '停止播放' : '播放日语语音'}
                </button>
                <label>
                  语速
                  <select
                    value={speechRate}
                    onChange={(event) =>
                      setSpeechRate(Number(event.target.value))
                    }
                  >
                    <option value={0.78}>慢速</option>
                    <option value={0.9}>自然</option>
                    <option value={1.05}>稍快</option>
                  </select>
                </label>
                {japaneseVoices.length > 1 && (
                  <label>
                    声音
                    <select
                      value={voiceUri}
                      onChange={(event) => setVoiceUri(event.target.value)}
                    >
                      {japaneseVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className={`audio-wave ${speaking ? 'playing' : ''}`}>
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <p>
                {japaneseVoices.length
                  ? '已优先使用高质量日语人声 · 非 JLPT 官方录音'
                  : '未检测到日语人声，将使用系统默认语音'}
              </p>
              {q.context && (
                <button
                  className="transcript-toggle"
                  onClick={() => setShowTranscript(!showTranscript)}
                >
                  {showTranscript ? '隐藏文字稿' : '显示文字稿'}
                </button>
              )}
            </div>
          )}
          {q.context && q.module !== '聴解' && (
            <div className="passage">{q.context}</div>
          )}
          {q.context && q.module === '聴解' && (showTranscript || checked) && (
            <div className="passage listening-transcript">{q.context}</div>
          )}
          <h2>
            {originalQuestionLabel(q) && (
              <span className="original-question-number">
                {originalQuestionLabel(q)}
              </span>
            )}
            {markedPrompt(q)}
          </h2>
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
            const a = sessionAnswers[item.id];
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIndex(i);
                  setChosen(null);
                  setChecked(false);
                  setShowTranscript(false);
                  window.speechSynthesis?.cancel();
                  setSpeaking(false);
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
              ? '点击播放日语语音后作答；可调整语速或按需查看文字稿。'
              : '每次切换分类或重新生成都会开启新的刷题会话；历史成绩仍用于学习统计。'}
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
  const [yearFilter, setYearFilter] = useState('全部');
  const [contentView, setContentView] = useState<'仅题目与选项' | '全部信息'>(
    '仅题目与选项',
  );
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const [reviewChoices, setReviewChoices] = useState<Record<number, number>>(
    {},
  );
  const toggleReview = (id: number, optionIndex: number) => {
    const isSameOpenChoice =
      revealedIds.includes(id) && reviewChoices[id] === optionIndex;
    setRevealedIds((current) =>
      isSameOpenChoice
        ? current.filter((revealedId) => revealedId !== id)
        : current.includes(id)
          ? current
          : [...current, id],
    );
    setReviewChoices((current) => {
      if (isSameOpenChoice) {
        const next = { ...current };
        delete next[id];
        return next;
      }
      return { ...current, [id]: optionIndex };
    });
  };
  const collapseReview = (id: number) => {
    setRevealedIds((current) =>
      current.filter((revealedId) => revealedId !== id),
    );
    setReviewChoices((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };
  const sourcePeriod = (wrong: Wrong) => {
    const source = questions.find(
      (question) => question.id === wrong.id,
    )?.source;
    return source?.match(/(?:19|20)\d{2}年\d{1,2}月/)?.[0] || '年份未知';
  };
  const sourcePeriods = useMemo(
    () =>
      [...new Set(wrongs.map(sourcePeriod))].sort((a, b) => {
        if (a === '年份未知') return 1;
        if (b === '年份未知') return -1;
        const sortable = (period: string) => {
          const match = period.match(/((?:19|20)\d{2})年(\d{1,2})月/);
          return match ? Number(match[1]) * 100 + Number(match[2]) : 0;
        };
        return sortable(b) - sortable(a);
      }),
    [wrongs],
  );
  const update = (id: number, patch: Partial<Wrong>) =>
    setWrongs(wrongs.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const filtered = wrongs.filter((wrong) => {
    const question = questions.find((q) => q.id === wrong.id)!;
    const statusOk =
      statusFilter === '全部' ||
      (statusFilter === '已掌握' ? wrong.mastered : !wrong.mastered);
    const yearOk = yearFilter === '全部' || sourcePeriod(wrong) === yearFilter;
    return (
      statusOk &&
      yearOk &&
      (moduleFilter === '全部' || question.module === moduleFilter)
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
        <div>
          <b>真题年份</b>
          <button
            className={yearFilter === '全部' ? 'active' : ''}
            onClick={() => setYearFilter('全部')}
          >
            全部
          </button>
          {sourcePeriods.map((year) => (
            <button
              key={year}
              className={yearFilter === year ? 'active' : ''}
              onClick={() => setYearFilter(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <div>
          <b>显示内容</b>
          {(['仅题目与选项', '全部信息'] as const).map((view) => (
            <button
              key={view}
              className={contentView === view ? 'active' : ''}
              onClick={() => {
                setContentView(view);
                setRevealedIds([]);
                setReviewChoices({});
              }}
            >
              {view}
            </button>
          ))}
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
            const individuallyRevealed = revealedIds.includes(q.id);
            const showFull = contentView === '全部信息' || individuallyRevealed;
            return (
              <article
                className={`wrong-real ${w.mastered ? 'mastered' : ''} ${
                  individuallyRevealed ? 'review-revealed' : ''
                }`}
                key={w.id}
              >
                {showFull && (
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
                )}
                <h3>
                  {originalQuestionLabel(q) && (
                    <span className="original-question-number">
                      {originalQuestionLabel(q)}
                    </span>
                  )}
                  {markedPrompt(q)}
                </h3>
                {showFull && q.source && (
                  <p className="source-ref">
                    {q.source} · 第 {q.sourceQuestion} 题
                    {q.frequency ? ` · 错误 ${q.frequency} 次` : ''}
                  </p>
                )}
                {q.options.length > 0 && (
                  <ol className={`imported-options ${optionLayoutClass(q)}`}>
                    {q.options.map((option, index) => (
                      <li key={`${q.id}-${index}`}>
                        {contentView === '仅题目与选项' ? (
                          <button
                            className={`review-option ${
                              reviewChoices[q.id] === index ? 'selected' : ''
                            }`}
                            onClick={() => toggleReview(q.id, index)}
                            aria-expanded={individuallyRevealed}
                          >
                            {markedOption(q, option)}
                          </button>
                        ) : (
                          markedOption(q, option)
                        )}
                      </li>
                    ))}
                  </ol>
                )}
                {showFull && (
                  <>
                    <div className="compare">
                      <p>
                        <small>你的答案</small>
                        <b>
                          {w.chosen >= 0
                            ? q.options[w.chosen]
                            : '原表未记录所选答案'}
                        </b>
                      </p>
                      <p>
                        <small>正确答案</small>
                        <b>{q.answerText || q.options[q.answer]}</b>
                      </p>
                    </div>
                    <p className="explain">{q.explain}</p>
                    {(q.translation || q.distractorExplain || q.expansion) && (
                      <details className="wrong-details">
                        <summary>查看翻译与完整解析</summary>
                        {q.translation && (
                          <section>
                            <b>题目翻译</b>
                            <p>{q.translation}</p>
                          </section>
                        )}
                        {q.distractorExplain && (
                          <section>
                            <b>错误选项讲解</b>
                            <p>{q.distractorExplain}</p>
                          </section>
                        )}
                        {q.expansion && (
                          <section>
                            <b>知识拓展</b>
                            <p>{q.expansion}</p>
                          </section>
                        )}
                      </details>
                    )}
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
                    {individuallyRevealed && (
                      <button
                        className="collapse-review"
                        onClick={() => collapseReview(q.id)}
                      >
                        收起答案解析
                      </button>
                    )}
                  </>
                )}
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
