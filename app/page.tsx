'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  NotebookPen,
  Pencil,
  Printer,
  Play,
  Plus,
  RotateCcw,
  Save,
  Moon,
  Square,
  Sun,
  Target,
  Trophy,
  TrendingUp,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import officialQuestions202512 from '@/lib/questions-2025-12.json';
import originalWrongQuestions from '@/lib/imported-wrongs.json';

type Module = '文字・語彙' | '文法' | '読解' | '聴解';
type PracticeTrack = Module | '過去問演習';
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
  audioSrc?: string;
  transcript?: string;
  focus?: string;
};
type Wrong = {
  id: number;
  chosen: number;
  reason: string;
  mastered: boolean;
  nextReview: string;
  reviewStage?: number;
  reviewCount?: number;
  lastReviewedAt?: string;
  updatedAt?: string;
};
type Attempt = {
  id: number;
  chosen: number;
  seconds: number;
  correct: boolean;
  mode?: string;
  sessionId?: string;
  createdAt?: string;
};
type StudyProfile = {
  examDate: string;
  dailyMinutes: number;
  targetScore: number;
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
/** 把题库中挤在一行的“1、2、3、4”选项拆成独立选项，供页面正确编号和排版。 */
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
// 2025 年 12 月整卷是当前四个专项的唯一题库，专项与本试验保持同步。
const questions: Question[] = (
  officialQuestions202512 as unknown as Question[]
).map((question) => ({
  ...question,
  options: expandNumberedOptions(question.options),
}));

// 原始错题是用户的个人学习资产，只供错题本恢复和展示，不混入专项训练题库。
const originalWrongQuestionBank: Question[] = (
  originalWrongQuestions as unknown as Question[]
).map((question) => {
  const rawOptions = question.prompt
    ? question.options
    : question.options.slice(1);
  return {
    ...question,
    prompt: question.prompt || question.options[0],
    options: expandNumberedOptions(rawOptions),
    targetSec: question.targetSec || 60,
  };
});

/** 查题时同时查找当前真题和原始错题，但训练抽题仍只使用 questions。 */
const findQuestion = (id: number) =>
  questions.find((question) => question.id === id) ||
  originalWrongQuestionBank.find((question) => question.id === id);
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
  [BookMarked, '单词本'],
  [Trophy, '分数模拟'],
  [TrendingUp, '学习数据'],
  [MessageCircle, 'AI 助手'],
] as const;

const practiceTracks: PracticeTrack[] = [
  '過去問演習',
  '文字・語彙',
  '文法',
  '読解',
  '聴解',
];

/** 从题目来源中读取“2025年12月”这样的考试批次。 */
const examPeriodOfQuestion = (question: Question) =>
  question.source?.match(/(?:19|20)\d{2}年\d{1,2}月/)?.[0] || null;

/** 把原卷题号转换成可排序的数字，保证整卷模式按原始顺序出题。 */
const sourceQuestionOrder = (question: Question) => {
  const numbers = question.sourceQuestion?.match(/\d+/g)?.map(Number) || [];
  return numbers.reduce((value, number) => value * 100 + number, 0);
};
/** 返回今天的日期（YYYY-MM-DD），用于判断某道错题今天是否需要复习。 */
const today = () => new Date().toISOString().slice(0, 10);
/** 从今天向后推指定天数，生成下一次复习日期。 */
const later = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** 给系统里的日语语音打分，优先选择自然、清晰的日语声音。 */
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

/** 过滤掉非日语声音，并按照上面的质量分数从好到差排序。 */
const rankJapaneseVoices = (voices: SpeechSynthesisVoice[]) =>
  voices
    .filter((voice) => voice.lang.toLowerCase().startsWith('ja'))
    .sort((a, b) => voiceQualityScore(b) - voiceQualityScore(a));

/** 从读音题的正确答案解析中找出真正被考查的词，例如只找出“閉鎖”。 */
const readingFocusTerm = (question: Question) => {
  if (question.type !== '漢字の読み方') return null;
  if (question.focus) return question.focus;
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

/** 把题库原始题号转换成页面标签，同时保留“問題4-3”这类特殊编号。 */
const originalQuestionLabel = (question: Question) => {
  if (!question.sourceQuestion) return null;
  return /^\d+$/.test(question.sourceQuestion)
    ? `第 ${question.sourceQuestion} 题`
    : question.sourceQuestion;
};

/** 清理题干中已经重复出现的题号，避免题号标签和正文显示两遍。 */
const displayPrompt = (question: Question) => {
  const withoutRepeatedNumber =
    !question.sourceQuestion || /^\d+$/.test(question.sourceQuestion)
      ? question.prompt
      : question.prompt.replace(
          new RegExp(
            `^${question.sourceQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[.．]\\s*`,
          ),
          '',
        );
  return (
    withoutRepeatedNumber
      // 对话题的新说话人必须从新行行首开始，避免 A、B 台词挤在一行。
      .replace(/\s*B「/g, '\nB「')
      // JLPT 句子排序题只有第三个空格是作答位置，其余三处显示普通空格线。
      .replace(/★[\s　]*★[\s　]*★[\s　]*★/g, '＿＿　＿＿　★　＿＿')
  );
};

/**
 * 在句子中寻找单词的实际形态。
 * 例如题目给出“くじける”，本函数也能认出“くじけない”和“くじけそう”。
 */
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

/** 从同义替换题的解析中识别题干考点，例如找出需要替换的“試練”。 */
const synonymFocusSurface = (question: Question) => {
  if (question.type !== '言い換え類義') return null;
  if (question.focus) return question.focus;
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
  // 正确选项是“同义词”而不是题干子串，不能用字符差异反推考点。
  // 旧做法会把整句误判为考点；没有明确 focus 时宁可不划线。
  return null;
};

/** 生成带考点下划线的题干；没有明确考点的题目保持原样。 */
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

/** 在“用法”题的某个选项里寻找被考查词，包括它的活用形式。 */
const usageFocusSurface = (question: Question, option: string) => {
  if (question.type !== '用法') return null;
  return inflectedSurface(question.prompt.trim(), option);
};

/** 生成带考点下划线的选项文字。 */
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

/** 根据选项长度自动选择排版：短词四列、中等短语两列、长句单列。 */
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

/**
 * 共用同一篇文章或听力原文的连续小题，只在第一次出现时展示材料。
 * 压缩空白后再比较，避免 PDF 换行差异造成看似相同的文章被重复显示。
 */
const sharedMaterialKey = (question: Question) => {
  const material =
    question.module === '聴解'
      ? question.transcript || question.context
      : question.context;
  return material
    ? `${question.module}:${material.replace(/\s+/g, ' ').trim()}`
    : '';
};

const shouldShowSharedMaterial = (paper: Question[], questionIndex: number) => {
  const key = sharedMaterialKey(paper[questionIndex]);
  if (!key) return true;
  return (
    paper.findIndex((question) => sharedMaterialKey(question) === key) ===
    questionIndex
  );
};

/** 把当前设备的错题分批保存到站点数据库，避免一次发送过多数据。 */
async function saveWrongs(deviceId: string, wrongs: Wrong[]) {
  const items = wrongs.flatMap((wrong) => {
    const question = findQuestion(wrong.id);
    return question
      ? [
          {
            ...wrong,
            module: question.module,
            type: question.type,
          },
        ]
      : [];
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

/** 保存一条单词；服务端会自动按当前登录账号或访客设备归档。 */
async function saveVocabularyEntry(deviceId: string, entry: VocabularyEntry) {
  const response = await fetch('/api/vocabulary', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId, entry }),
  });
  if (!response.ok) throw new Error('failed to save vocabulary');
  return (await response.json()) as VocabularyEntry;
}
type AccountState = { signedIn: boolean; email?: string };
type VocabularyEntry = {
  id: string;
  word: string;
  kana: string;
  meaning: string;
  usage?: string;
  sourceContext?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 修正曾被免费词典保存成英文的词条；读取时自动更新本地与云端记录。
const vocabularyMeaningCorrections: Record<string, string> = {
  軋轢: '摩擦；不和；冲突',
};
const normalizeVocabularyEntry = (entry: VocabularyEntry): VocabularyEntry => ({
  ...entry,
  meaning: vocabularyMeaningCorrections[entry.word] || entry.meaning,
});

type VocabularyImportRow = { word: string; kana?: string; meaning?: string };

/** 统一全角、半角和误输入的空格，用于判断两个词是否为同一词。 */
const vocabularyWordKey = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '');

/** 保留最早出现的一条，返回需要删除的历史重复记录。 */
const dedupeVocabularyEntries = (entries: VocabularyEntry[]) => {
  const unique: VocabularyEntry[] = [];
  const duplicateIds: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = vocabularyWordKey(entry.word);
    if (seen.has(key)) duplicateIds.push(entry.id);
    else {
      seen.add(key);
      unique.push(entry);
    }
  }
  return { unique, duplicateIds };
};

/** 解析 Markdown 表格、制表符、逗号或逐行单词，忽略表头和分隔线。 */
const parseVocabularyImport = (text: string): VocabularyImportRow[] => {
  const rows: VocabularyImportRow[] = [];
  const seen = new Set<string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^[“"]|[”"]$/g, '');
    if (!line || /^\|?\s*:?-{3,}/.test(line)) continue;
    let cells = line.includes('|')
      ? line.split('|').map((item) => item.trim()).filter(Boolean)
      : line.includes('\t')
        ? line.split('\t').map((item) => item.trim())
        : line.includes(',') || line.includes('，')
          ? line.split(/[,，]/).map((item) => item.trim())
          : [line];
    if (cells.some((item) => /^(#|序号|单词|读音|假名|中文意思)$/.test(item)))
      continue;
    if (/^\d+$/.test(cells[0] || '')) cells = cells.slice(1);
    const [word, kana, ...meaningParts] = cells;
    const key = vocabularyWordKey(word || '');
    if (!word || seen.has(key) || !/[ぁ-んァ-ヶ一-龠々ー]/.test(word))
      continue;
    seen.add(key);
    rows.push({ word, kana, meaning: meaningParts.join('；') || undefined });
  }
  return rows;
};

/** 恢复用户原始导入的错题，不改动已有的复习记录。 */
const importedWrongs = (): Wrong[] =>
  originalWrongQuestionBank.map((question) => ({
    id: question.id,
    chosen: -1,
    reason: '待分析',
    mastered: false,
    nextReview: today(),
  }));

/** 网站主入口：管理当前页面、主题、答题记录和错题，并在左侧导航间切换。 */
export default function Home() {
  const [active, setActive] = useState('今日学习');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [wrongs, setWrongs] = useState<Wrong[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [dbReady, setDbReady] = useState(false);
  const [account, setAccount] = useState<AccountState | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [vocabularyDialogOpen, setVocabularyDialogOpen] = useState(false);
  const [vocabularyImportOpen, setVocabularyImportOpen] = useState(false);
  const [vocabularySaving, setVocabularySaving] = useState(false);
  const [vocabularyError, setVocabularyError] = useState('');
  const [vocabularyImportText, setVocabularyImportText] = useState('');
  const [vocabularyImportError, setVocabularyImportError] = useState('');
  const [vocabularyDraft, setVocabularyDraft] = useState({
    word: '',
    kana: '',
    meaning: '',
    usage: '',
    sourceContext: '',
  });
  const [selectionAction, setSelectionAction] = useState<{
    word: string;
    context: string;
    x: number;
    y: number;
  } | null>(null);
  const [profile, setProfile] = useState<StudyProfile>({
    examDate: '2026-12-06',
    dailyMinutes: 30,
    targetScore: 120,
  });
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
  /** 在浅色和深色主题之间切换，并记住用户的选择。 */
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('ippo-theme', next);
  };
  useEffect(() => {
    /** 从浏览器和数据库恢复学习记录；数据库不可用时自动使用本地记录。 */
    const hydrate = async () => {
      setAttempts(JSON.parse(localStorage.getItem('ippo-attempts') || '[]'));
      setDone(JSON.parse(localStorage.getItem('ippo-done') || '[]'));
      const localWrongs: Wrong[] = JSON.parse(
        localStorage.getItem('ippo-wrongs') || '[]',
      );
      const localVocabulary: VocabularyEntry[] = (
        JSON.parse(
          localStorage.getItem('ippo-vocabulary') || '[]',
        ) as VocabularyEntry[]
      ).map(normalizeVocabularyEntry);
      let id = localStorage.getItem('ippo-device-id');
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('ippo-device-id', id);
      }
      setDeviceId(id);
      try {
        // 登录后先把这台设备的历史数据并入账号，再读取账号的完整记录。
        const accountResponse = await fetch('/api/account', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ deviceId: id }),
        });
        const signedIn = accountResponse.ok;
        if (signedIn) {
          setAccount(await accountResponse.json());
        } else {
          const statusResponse = await fetch('/api/account');
          setAccount(
            statusResponse.ok
              ? await statusResponse.json()
              : { signedIn: false },
          );
        }
        if (!signedIn && localWrongs.length) {
          await saveWrongs(id, localWrongs);
        }
        const response = await fetch(
          `/api/wrongs?deviceId=${encodeURIComponent(id)}`,
        );
        if (!response.ok) throw new Error('database unavailable');
        let hydrated: Wrong[] = await response.json();
        if (!localStorage.getItem('ippo-original-wrongs-v3')) {
          const merged = new Map(hydrated.map((wrong) => [wrong.id, wrong]));
          importedWrongs().forEach((wrong) => {
            if (!merged.has(wrong.id)) merged.set(wrong.id, wrong);
          });
          hydrated = [...merged.values()];
          await saveWrongs(id, hydrated);
          localStorage.setItem('ippo-original-wrongs-v3', '1');
        }
        // 账号初次建立时，补上只存在于当前浏览器缓存中的题目。
        if (signedIn && localWrongs.length) {
          const merged = new Map(hydrated.map((wrong) => [wrong.id, wrong]));
          localWrongs.forEach((wrong) => {
            if (!merged.has(wrong.id)) merged.set(wrong.id, wrong);
          });
          hydrated = [...merged.values()];
          await saveWrongs(id, hydrated);
        }
        setWrongs(hydrated);
        const progressResponse = await fetch(
          `/api/progress?deviceId=${encodeURIComponent(id)}`,
        );
        if (progressResponse.ok) {
          const progress = (await progressResponse.json()) as {
            attempts?: Attempt[];
            profile?: StudyProfile;
          };
          if (progress.attempts?.length) setAttempts(progress.attempts);
          if (progress.profile) setProfile(progress.profile);
        }
        const vocabularyResponse = await fetch(
          `/api/vocabulary?deviceId=${encodeURIComponent(id)}`,
        );
        if (vocabularyResponse.ok) {
          const rawCloudVocabulary =
            (await vocabularyResponse.json()) as VocabularyEntry[];
          const cloudVocabulary = rawCloudVocabulary.map(normalizeVocabularyEntry);
          const merged = new Map(
            cloudVocabulary.map((entry) => [entry.word, entry]),
          );
          for (const entry of cloudVocabulary) {
            const original = rawCloudVocabulary.find((item) => item.id === entry.id);
            if (original?.meaning !== entry.meaning)
              await saveVocabularyEntry(id, entry);
          }
          for (const entry of localVocabulary) {
            if (!merged.has(entry.word)) {
              const saved = await saveVocabularyEntry(id, entry);
              merged.set(saved.word, saved);
            }
          }
          const deduped = dedupeVocabularyEntries([...merged.values()]);
          setVocabulary(deduped.unique);
          for (const duplicateId of deduped.duplicateIds)
            await fetch(`/api/vocabulary?deviceId=${encodeURIComponent(id)}&id=${encodeURIComponent(duplicateId)}`, { method: 'DELETE' });
        } else setVocabulary(localVocabulary);
        setDbReady(true);
      } catch {
        setAccount((current) => current || { signedIn: false });
        if (!localStorage.getItem('ippo-original-wrongs-v3')) {
          const merged = new Map(localWrongs.map((wrong) => [wrong.id, wrong]));
          importedWrongs().forEach((wrong) => {
            if (!merged.has(wrong.id)) merged.set(wrong.id, wrong);
          });
          setWrongs([...merged.values()]);
          localStorage.setItem('ippo-original-wrongs-v3', '1');
        } else {
          setWrongs(localWrongs);
        }
        setVocabulary(localVocabulary);
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
      localStorage.setItem('ippo-vocabulary', JSON.stringify(vocabulary));
    }
  }, [attempts, wrongs, done, vocabulary, loaded]);
  useEffect(() => {
    if (dbReady && deviceId) void saveWrongs(deviceId, wrongs);
  }, [wrongs, deviceId, dbReady]);
  /**
   * 登录后定期读取账号中的最新错题状态。
   * 这样手机或电脑修改“已掌握”后，另一台已打开的设备无需刷新也会同步。
   */
  useEffect(() => {
    if (!account?.signedIn || !dbReady || !deviceId) return;
    let stopped = false;
    const refreshWrongs = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(
          `/api/wrongs?deviceId=${encodeURIComponent(deviceId)}`,
          { cache: 'no-store' },
        );
        if (!response.ok || stopped) return;
        const cloudWrongs = (await response.json()) as Wrong[];
        if (stopped) return;
        setWrongs((current) => {
          const currentById = new Map(current.map((wrong) => [wrong.id, wrong]));
          let changed = current.length !== cloudWrongs.length;
          const cloudIds = new Set(cloudWrongs.map((wrong) => wrong.id));
          const merged = cloudWrongs.map((cloud) => {
            const local = currentById.get(cloud.id);
            // 手机上传较慢时，云端可能短暂返回操作前的旧记录。
            // 本地记录时间更新就继续保留它，待保存完成后的下一轮再统一。
            if (
              local?.updatedAt &&
              (!cloud.updatedAt || local.updatedAt > cloud.updatedAt)
            )
              return local;
            if (!local || local.updatedAt !== cloud.updatedAt) changed = true;
            return cloud;
          });
          // 新加入错题本但尚未上传完成的题目也不能被一次旧的云端响应删掉。
          current.forEach((local) => {
            if (!cloudIds.has(local.id) && local.updatedAt) merged.push(local);
          });
          return changed ? merged : current;
        });
      } catch {
        // 临时断网时保留页面数据，下一次轮询会自动重试。
      }
    };
    const timer = window.setInterval(() => void refreshWrongs(), 5000);
    const onFocus = () => void refreshWrongs();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [account?.signedIn, dbReady, deviceId]);
  /** 在题目区域选中日文后，显示一个靠近选区的“加入单词本”按钮。 */
  useEffect(() => {
    const captureSelection = () => {
      window.setTimeout(() => {
        const selection = window.getSelection();
        const target = selection?.anchorNode?.parentElement;
        const word = selection
          ?.toString()
          .trim()
          .replace(/^[「『（(\s]+|[」』）)、。！？!?\s]+$/g, '');
        const learningArea = target?.closest(
          '.question-card, .exam-question-card, .wrong-real, .passage',
        );
        if (
          !selection ||
          !word ||
          word.length > 40 ||
          !/[ぁ-んァ-ヶ一-龠々ー]/.test(word) ||
          !learningArea
        ) {
          setSelectionAction(null);
          return;
        }
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setSelectionAction({
          word,
          context: learningArea.textContent?.trim().slice(0, 500) || '',
          x: Math.min(
            Math.max(rect.left + rect.width / 2, 76),
            window.innerWidth - 76,
          ),
          y: Math.max(rect.top - 46, 12),
        });
      }, 0);
    };
    document.addEventListener('mouseup', captureSelection);
    document.addEventListener('touchend', captureSelection);
    return () => {
      document.removeEventListener('mouseup', captureSelection);
      document.removeEventListener('touchend', captureSelection);
    };
  }, []);
  /** 打开统一的单词编辑表单；题目选词时会自动填好日文和来源。 */
  const openVocabularyDialog = (word = '', sourceContext = '') => {
    setVocabularyDraft({
      word,
      kana: '',
      meaning: '',
      usage: '',
      sourceContext,
    });
    setSelectionAction(null);
    setVocabularyError('');
    setVocabularySaving(false);
    setVocabularyDialogOpen(true);
  };
  /** 自动查询读音和中文释义，再保存为单词本表格中的一行。 */
  const addVocabulary = async () => {
    const requestedWord = vocabularyDraft.word.trim();
    if (!deviceId || !requestedWord || vocabularySaving) return;
    setVocabularySaving(true);
    setVocabularyError('');
    try {
      const enrichResponse = await fetch('/api/vocabulary/enrich', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ word: requestedWord }),
      });
      const enriched =
        (await enrichResponse.json()) as Partial<VocabularyEntry> & {
          error?: string;
        };
      if (
        !enrichResponse.ok ||
        !enriched.word ||
        !enriched.kana ||
        !enriched.meaning
      )
        throw new Error(enriched.error || '没有查到完整词条');
      const enrichedKey = vocabularyWordKey(enriched.word);
      const existing = vocabulary.find(
        (entry) => vocabularyWordKey(entry.word) === enrichedKey,
      );
      const provisional: VocabularyEntry = {
        id: existing?.id || crypto.randomUUID(),
        word: existing?.word || enriched.word,
        kana: enriched.kana,
        meaning: enriched.meaning,
        usage: enriched.usage || '',
        sourceContext: vocabularyDraft.sourceContext,
        updatedAt: new Date().toISOString(),
      };
      const saved = await saveVocabularyEntry(deviceId, provisional);
      setVocabulary((current) => {
        const savedKey = vocabularyWordKey(saved.word);
        const index = current.findIndex(
          (entry) => vocabularyWordKey(entry.word) === savedKey,
        );
        if (index < 0) return [...current, saved];
        return current.map((entry, position) => position === index ? saved : entry);
      });
      setVocabularyDialogOpen(false);
    } catch (error) {
      setVocabularyError(
        error instanceof Error ? error.message : '自动查询失败，请重试',
      );
    } finally {
      setVocabularySaving(false);
    }
  };
  /** 保存用户手动修改的读音或中文意思，并保持该词原来的序号。 */
  const updateVocabulary = async (entry: VocabularyEntry) => {
    if (!deviceId) throw new Error('数据尚未加载完成');
    const saved = await saveVocabularyEntry(deviceId, entry);
    setVocabulary((current) =>
      current.map((item) => item.id === entry.id ? saved : item),
    );
  };
  /** 批量导入完整表格；只有单词时，逐条自动补全读音和中文意思。 */
  const importVocabulary = async () => {
    const rows = parseVocabularyImport(vocabularyImportText);
    if (!deviceId || vocabularySaving) return;
    if (!rows.length) {
      setVocabularyImportError('没有识别到可导入的日文单词');
      return;
    }
    setVocabularySaving(true);
    setVocabularyImportError('');
    try {
      const next = [...vocabulary];
      for (const row of rows) {
        let kana = row.kana?.trim() || '';
        let meaning = row.meaning?.trim() || '';
        if (!kana || !meaning) {
          const response = await fetch('/api/vocabulary/enrich', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ word: row.word }),
          });
          const enriched = (await response.json()) as Partial<VocabularyEntry> & { error?: string };
          if (!response.ok || !enriched.kana || !enriched.meaning)
            throw new Error(`「${row.word}」${enriched.error || '无法自动补全'}`);
          kana ||= enriched.kana;
          meaning ||= enriched.meaning;
        }
        const rowKey = vocabularyWordKey(row.word);
        const existingIndex = next.findIndex(
          (entry) => vocabularyWordKey(entry.word) === rowKey,
        );
        const saved = await saveVocabularyEntry(deviceId, {
          id: existingIndex >= 0 ? next[existingIndex].id : crypto.randomUUID(),
          word: existingIndex >= 0 ? next[existingIndex].word : row.word.trim(),
          kana,
          meaning,
          usage: existingIndex >= 0 ? next[existingIndex].usage || '' : '',
          sourceContext: existingIndex >= 0 ? next[existingIndex].sourceContext : '',
          updatedAt: new Date().toISOString(),
        });
        if (existingIndex >= 0) next[existingIndex] = saved;
        else next.push(saved);
      }
      setVocabulary(next);
      setVocabularyImportText('');
      setVocabularyImportOpen(false);
    } catch (error) {
      setVocabularyImportError(error instanceof Error ? error.message : '批量导入失败');
    } finally {
      setVocabularySaving(false);
    }
  };
  /** 删除指定词条；数据库暂时离线时也先从本地列表移除。 */
  const deleteVocabulary = async (id: string) => {
    setVocabulary((current) => current.filter((entry) => entry.id !== id));
    if (deviceId)
      void fetch(
        `/api/vocabulary?deviceId=${encodeURIComponent(deviceId)}&id=${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      );
  };
  /** 清理旧数据中的重复词条；保留序号更靠前的记录。 */
  const deduplicateVocabulary = async () => {
    const { unique, duplicateIds } = dedupeVocabularyEntries(vocabulary);
    if (!duplicateIds.length) return 0;
    setVocabulary(unique);
    await Promise.all(
      duplicateIds.map((id) =>
        fetch(
          `/api/vocabulary?deviceId=${encodeURIComponent(deviceId)}&id=${encodeURIComponent(id)}`,
          { method: 'DELETE' },
        ),
      ),
    );
    return duplicateIds.length;
  };
  // 根据所有作答记录整理首页、分数模拟和学习数据页共用的统计结果。
  const stats = useMemo(() => {
    /** 计算某一个学习模块的真实答题正确率。 */
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
  /** 记录一次作答；答错时自动把题目加入错题本。 */
  const submit = (a: Attempt) => {
    const recorded = { ...a, createdAt: new Date().toISOString() };
    setAttempts((p) => [...p, recorded]);
    const existing = wrongs.find((w) => w.id === a.id);
    if (!a.correct && !existing)
      setWrongs((p) => [
        ...p,
        {
          id: a.id,
          chosen: a.chosen,
          reason: '待分析',
          mastered: false,
          nextReview: later(1),
          reviewStage: 0,
          reviewCount: 0,
          updatedAt: new Date().toISOString(),
        },
      ]);
    else if (existing) {
      const oldStage = existing.reviewStage || 0;
      const stage = a.correct ? Math.min(4, oldStage + 1) : 0;
      const intervals = [1, 3, 7, 14, 30];
      setWrongs((p) =>
        p.map((w) =>
          w.id === a.id
            ? {
                ...w,
                chosen: a.chosen,
                mastered: a.correct && stage >= 4,
                reviewStage: stage,
                reviewCount: (w.reviewCount || 0) + 1,
                lastReviewedAt: new Date().toISOString(),
                nextReview: later(a.correct ? intervals[stage] : 1),
                updatedAt: new Date().toISOString(),
              }
            : w,
        ),
      );
    }
    const question = questions.find((q) => q.id === a.id);
    if (dbReady && deviceId && question)
      void fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          attempt: {
            ...recorded,
            sessionId: a.sessionId || crypto.randomUUID(),
            module: question.module,
            type: question.type,
            mode: a.mode || 'practice',
          },
        }),
      });
  };
  /** 只重置统计与今日任务；历史错题和复习状态始终保留。 */
  const reset = async () => {
    if (
      confirm(
        '只重置本机学习统计和今日任务。错题本及数据库错题不会删除，确定继续吗？',
      )
    ) {
      setAttempts([]);
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
            <small>
              {account?.signedIn
                ? '学习记录已跨设备同步'
                : '访客数据保存在此设备'}
            </small>
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
              ? account?.signedIn
                ? `已登录 ${account.email}，电脑与手机会同步。`
                : '当前为访客模式；登录后可在电脑与手机之间同步。'
              : '数据库暂时不可用，错题会先保存在当前设备。'}
          </p>
          <button onClick={reset}>
            <RotateCcw size={13} /> 重置学习统计
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
            {account?.signedIn ? (
              <a
                className="account-button signed-in"
                href="/signout-with-chatgpt?return_to=%2F"
                target="_top"
                title={`${account.email}（点击退出）`}
              >
                <LogOut size={16} />
                <span>{account.email}</span>
              </a>
            ) : (
              <a
                className="account-button"
                href="/signin-with-chatgpt?return_to=%2F"
                target="_top"
                title="使用邮箱验证码安全登录"
              >
                <LogIn size={16} />
                <span>邮箱验证码登录</span>
              </a>
            )}
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
            attempts={attempts}
            profile={profile}
            setProfile={(next) => {
              setProfile(next);
              if (deviceId)
                void fetch('/api/progress', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ deviceId, profile: next }),
                });
            }}
          />
        )}{' '}
        {active === '诊断测试' && (
          <Quiz
            mode="diagnostic"
            attempts={attempts}
            onSubmit={submit}
            deviceId={deviceId}
          />
        )}{' '}
        {active === '专项训练' && (
          <Quiz
            mode="practice"
            attempts={attempts}
            onSubmit={submit}
            deviceId={deviceId}
          />
        )}{' '}
        {active === '错题本' && (
          <WrongBook wrongs={wrongs} setWrongs={setWrongs} />
        )}{' '}
        {active === '单词本' && (
          <VocabularyBook
            entries={vocabulary}
            onAdd={() => openVocabularyDialog()}
            onImport={() => {
              setVocabularyImportError('');
              setVocabularyImportOpen(true);
            }}
            onUpdate={updateVocabulary}
            onDedupe={deduplicateVocabulary}
            onDelete={deleteVocabulary}
          />
        )}{' '}
        {active === '分数模拟' && (
          <Score stats={stats} attempts={attempts} go={setActive} />
        )}{' '}
        {active === '学习数据' && (
          <Data stats={stats} attempts={attempts} wrongs={wrongs} />
        )}
        {active === 'AI 助手' && (
          <StudyAssistant attempts={attempts} wrongs={wrongs} />
        )}
      </section>
      {selectionAction && (
        <button
          className="selection-vocabulary-button"
          style={{ left: selectionAction.x, top: selectionAction.y }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            openVocabularyDialog(selectionAction.word, selectionAction.context)
          }
        >
          <Plus size={15} /> 加入单词本
        </button>
      )}
      <Dialog
        open={vocabularyDialogOpen}
        onOpenChange={setVocabularyDialogOpen}
      >
        <DialogContent className="vocabulary-dialog">
          <DialogHeader>
            <DialogTitle>收录单词</DialogTitle>
            <DialogDescription>
              只需输入日文汉字或假名，系统会自动补全其余资料。
            </DialogDescription>
          </DialogHeader>
          <div className="vocabulary-form">
            <label>
              <span>日文</span>
              <Input
                value={vocabularyDraft.word}
                onChange={(event) =>
                  setVocabularyDraft((draft) => ({
                    ...draft,
                    word: event.target.value,
                  }))
                }
                placeholder="例：見落とす"
                disabled={vocabularySaving}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void addVocabulary();
                }}
              />
            </label>
            {vocabularyDraft.sourceContext && (
              <p className="vocabulary-source-preview">
                <b>将同时保留题目语境：</b>
                {vocabularyDraft.sourceContext}
              </p>
            )}
            {vocabularyError && (
              <p className="vocabulary-error" role="alert">
                {vocabularyError}
              </p>
            )}
          </div>
          <DialogFooter>
            <button
              className="ghost vocabulary-cancel"
              onClick={() => setVocabularyDialogOpen(false)}
              disabled={vocabularySaving}
            >
              取消
            </button>
            <button
              className="solid"
              disabled={!vocabularyDraft.word.trim() || vocabularySaving}
              onClick={addVocabulary}
            >
              {vocabularySaving ? '正在自动查询…' : '自动补全并保存'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={vocabularyImportOpen} onOpenChange={setVocabularyImportOpen}>
        <DialogContent className="vocabulary-dialog">
          <DialogHeader>
            <DialogTitle>批量导入单词</DialogTitle>
            <DialogDescription>
              可粘贴 Markdown 表格、Excel 三列内容，或每行一个单词。
            </DialogDescription>
          </DialogHeader>
          <div className="vocabulary-form">
            <label>
              <span>单词内容</span>
              <textarea
                value={vocabularyImportText}
                onChange={(event) => setVocabularyImportText(event.target.value)}
                placeholder={'大抵\tたいてい\t大抵；大多；通常\n挫折\tざせつ\t挫折；受挫'}
                disabled={vocabularySaving}
                rows={9}
              />
            </label>
            <p className="vocabulary-import-tip">
              已提供读音和中文意思时直接导入；每行只有单词时由系统自动查询。
            </p>
            {vocabularyImportError && <p className="vocabulary-error" role="alert">{vocabularyImportError}</p>}
          </div>
          <DialogFooter>
            <button className="ghost vocabulary-cancel" onClick={() => setVocabularyImportOpen(false)} disabled={vocabularySaving}>取消</button>
            <button className="solid" onClick={importVocabulary} disabled={!vocabularyImportText.trim() || vocabularySaving}>
              {vocabularySaving ? '正在导入…' : '开始导入'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

/** 今日学习首页：展示起点、模块正确率、每日计划和下一步建议。 */
function Dashboard({
  stats,
  done,
  setDone,
  go,
  wrongCount,
  attempts,
  profile,
  setProfile,
}: {
  stats: any;
  done: string[];
  setDone: (x: string[]) => void;
  go: (x: string) => void;
  wrongCount: number;
  attempts: Attempt[];
  profile: StudyProfile;
  setProfile: (profile: StudyProfile) => void;
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / 86400000),
  );
  const phase =
    daysLeft > 150
      ? '基础补强期'
      : daysLeft > 90
        ? '分模块训练期'
        : daysLeft > 45
          ? '真题训练期'
          : daysLeft > 14
            ? '全套模拟期'
            : '考前调整期';
  const moduleRows = (['文字・語彙', '文法', '読解', '聴解'] as Module[]).map(
    (module) => {
      const rows = attempts.filter(
        (a) => questions.find((q) => q.id === a.id)?.module === module,
      );
      const rate = rows.length
        ? rows.filter((a) => a.correct).length / rows.length
        : 0.5;
      return { module, need: 1.15 - rate };
    },
  );
  const totalNeed = moduleRows.reduce((sum, row) => sum + row.need, 0);
  const reviewMinutes = Math.max(5, Math.round(profile.dailyMinutes * 0.18));
  const trainingMinutes = Math.max(10, profile.dailyMinutes - reviewMinutes);
  const moduleMinutes = new Map(
    moduleRows.map((row) => [
      row.module,
      Math.max(3, Math.round((trainingMinutes * row.need) / totalNeed)),
    ]),
  );
  const tasks = [
    ['词汇辨析', `训练 ${moduleMinutes.get('文字・語彙')} 分钟`, '专项训练'],
    ['语法训练', `训练 ${moduleMinutes.get('文法')} 分钟`, '专项训练'],
    [
      '限时阅读/听力',
      `训练 ${Math.max(moduleMinutes.get('読解') || 0, moduleMinutes.get('聴解') || 0)} 分钟`,
      '专项训练',
    ],
    ['间隔复习', `${wrongCount} 道未掌握 · ${reviewMinutes} 分钟`, '错题本'],
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
      <section className="white-card plan-settings">
        <div className="card-head">
          <div>
            <span className="kicker">EXAM ROADMAP</span>
            <h2>考试倒计时与动态计划</h2>
          </div>
          <b>{daysLeft} 天</b>
        </div>
        <div className="plan-profile">
          <label>
            考试日期
            <input
              type="date"
              value={profile.examDate}
              onChange={(e) =>
                setProfile({ ...profile, examDate: e.target.value })
              }
            />
          </label>
          <label>
            每天学习
            <select
              value={profile.dailyMinutes}
              onChange={(e) =>
                setProfile({ ...profile, dailyMinutes: Number(e.target.value) })
              }
            >
              {[20, 30, 45, 60, 90].map((n) => (
                <option key={n} value={n}>
                  {n} 分钟
                </option>
              ))}
            </select>
          </label>
          <label>
            目标分
            <select
              value={profile.targetScore}
              onChange={(e) =>
                setProfile({ ...profile, targetScore: Number(e.target.value) })
              }
            >
              {[100, 110, 120, 140, 160].map((n) => (
                <option key={n} value={n}>
                  {n} 分
                </option>
              ))}
            </select>
          </label>
          <div className="phase-chip">
            <CalendarDays size={18} />
            <span>当前阶段</span>
            <b>{phase}</b>
          </div>
        </div>
      </section>
    </div>
  );
}

/** 诊断/专项答题页面：负责抽题、计时、语音播放、提交答案和切换题目。 */
function Quiz({
  mode,
  attempts,
  onSubmit,
  deviceId,
}: {
  mode: string;
  attempts: Attempt[];
  onSubmit: (a: Attempt) => void;
  deviceId: string;
}) {
  const [practiceModule, setPracticeModule] =
    useState<PracticeTrack>('過去問演習');
  const [sessionSeed, setSessionSeed] = useState(() => Date.now());
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [generation, setGeneration] = useState(1);
  const [sessionAnswers, setSessionAnswers] = useState<Record<number, Attempt>>(
    {},
  );
  // 诊断模式混合全部科目；专项模式只抽取当前选择科目的题目。
  const pool = useMemo(() => {
    const ranked = (source: Question[]) =>
      [...source].sort((a, b) => {
        const score = (id: number) => Math.sin(id * 999 + sessionSeed) * 10000;
        return score(a.id) - score(b.id);
      });
    if (mode === 'practice') {
      if (practiceModule === '過去問演習') return questions.slice(0, 1);
      const source = ranked(
        questions.filter((q) => q.module === practiceModule),
      );
      const fresh = source.filter((q) => !attempts.some((a) => a.id === q.id));
      return [...fresh, ...source.filter((q) => !fresh.includes(q))].slice(
        0,
        10,
      );
    }
    const perModule = mode === 'diagnostic' ? 8 : 5;
    return (['文字・語彙', '文法', '読解', '聴解'] as Module[]).flatMap(
      (module) =>
        ranked(questions.filter((q) => q.module === module)).slice(
          0,
          perModule,
        ),
    );
  }, [mode, practiceModule, sessionSeed, attempts]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [start, setStart] = useState(Date.now());
  const [speechRate, setSpeechRate] = useState(0.9);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionSaved = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voiceUri, setVoiceUri] = useState('');
  const q = pool[index];
  const doneCount = pool.filter((x) => sessionAnswers[x.id]).length;
  const sessionRows = Object.values(sessionAnswers);
  const totalTarget = pool.reduce((sum, item) => sum + item.targetSec, 0);
  const sessionCorrect = sessionRows.filter((row) => row.correct).length;
  const slowCorrect = sessionRows.filter(
    (row) =>
      row.correct &&
      row.seconds > (questions.find((q) => q.id === row.id)?.targetSec || 60),
  ).length;
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
  useEffect(() => {
    const timer = window.setInterval(
      () => setElapsed(Math.round((Date.now() - start) / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [start]);
  useEffect(() => {
    const timer = window.setInterval(
      () => setTotalElapsed(Math.round((Date.now() - sessionStartedAt) / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [sessionStartedAt]);
  useEffect(() => {
    if (
      !deviceId ||
      !pool.length ||
      doneCount !== pool.length ||
      sessionSaved.current
    )
      return;
    sessionSaved.current = true;
    void fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        session: {
          id: sessionId,
          mode,
          totalQuestions: pool.length,
          correctQuestions: sessionCorrect,
          elapsedSeconds: totalElapsed,
          completedAt: new Date().toISOString(),
        },
      }),
    });
  }, [
    deviceId,
    doneCount,
    pool.length,
    mode,
    sessionId,
    sessionCorrect,
    totalElapsed,
  ]);
  /** 切换题型或重新抽题时，清空本轮答案并从第一题重新开始。 */
  const resetSession = () => {
    setSessionSeed((seed) => seed + 1);
    setSessionId(crypto.randomUUID());
    sessionSaved.current = false;
    setSessionStartedAt(Date.now());
    setTotalElapsed(0);
    setGeneration((value) => value + 1);
    setSessionAnswers({});
    setIndex(0);
    setChosen(null);
    setChecked(false);
    setShowTranscript(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setStart(Date.now());
    setElapsed(0);
  };
  /** 使用设备上的最佳日语语音朗读听力材料。 */
  const playListening = () => {
    if (q.audioSrc) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(q.audioSrc);
      audio.playbackRate = speechRate;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => {
        setSpeaking(false);
      };
      audioRef.current = audio;
      setSpeaking(true);
      void audio.play();
      return;
    }
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const quoted = q.prompt.match(/「([^」]+)」/)?.[1];
    const selectedVoice =
      japaneseVoices.find((voice) => voice.voiceURI === voiceUri) ||
      japaneseVoices[0];
    const alternateVoice = japaneseVoices.find(
      (voice) => voice.voiceURI !== selectedVoice?.voiceURI,
    );
    const listeningText = q.transcript || q.context || '';
    const dialogue = listeningText
      ? [
          ...listeningText.matchAll(/([男女])：([\s\S]*?)(?=(?:女|男)：|$)/g),
        ].map((match) => ({ speaker: match[1], text: match[2].trim() }))
      : [];
    const segments = dialogue.length
      ? dialogue
      : [{ speaker: '女', text: quoted || listeningText || q.prompt }];
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
  /** 提交当前选择，把是否正确和所用时间交给主页面保存。 */
  const answer = () => {
    if (chosen === null) return;
    const seconds = Math.max(1, Math.round((Date.now() - start) / 1000));
    const result = {
      id: q.id,
      chosen,
      seconds,
      correct: chosen === q.answer,
      mode,
      sessionId,
    };
    onSubmit(result);
    setSessionAnswers((current) => ({ ...current, [q.id]: result }));
    setChecked(true);
  };
  /** 进入下一题，并重置当前题的选择、解析和计时状态。 */
  const next = () => {
    setIndex((index + 1) % pool.length);
    setChosen(null);
    setChecked(false);
    setShowTranscript(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setStart(Date.now());
  };
  const choosePracticeTrack = (track: PracticeTrack) => {
    setPracticeModule(track);
    setSessionId(crypto.randomUUID());
    sessionSaved.current = false;
    setSessionStartedAt(Date.now());
    setTotalElapsed(0);
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
    setElapsed(0);
  };

  if (mode === 'practice' && practiceModule === '過去問演習') {
    return (
      <PastExamTraining
        activeTrack={practiceModule}
        onChooseTrack={choosePracticeTrack}
        onSubmit={onSubmit}
      />
    );
  }
  return (
    <div className="workspace">
      <div className="quiz-head">
        <div>
          <span className="kicker">
            {mode === 'diagnostic' ? '入学诊断' : '专项训练'}
          </span>
          <h1>
            {mode === 'diagnostic'
              ? '32 道分层诊断 · 正确率与速度联合分析'
              : mode === 'mock'
                ? 'N1 全套计时模拟'
                : `${practiceModule}专项训练`}
          </h1>
          <p>
            第 {generation} 组 · 已完成 {doneCount}/{pool.length} ·
            {mode === 'mock'
              ? ` 全卷剩余 ${Math.max(0, Math.floor((totalTarget - totalElapsed) / 60))}:${String(Math.max(0, totalTarget - totalElapsed) % 60).padStart(2, '0')}`
              : ' 重新生成会重置本轮状态'}
          </p>
        </div>
        <div className="quiz-tools">
          {mode === 'practice' && (
            <button className="regenerate" onClick={resetSession}>
              <RotateCcw size={15} /> 重新生成一组
            </button>
          )}
          <div className="live-time">
            <Clock3 size={18} />{' '}
            {elapsed > q.targetSec
              ? `已超时 ${elapsed - q.targetSec} 秒`
              : `剩余建议 ${q.targetSec - elapsed} 秒`}
          </div>
        </div>
      </div>
      {mode === 'practice' && (
        <div className="practice-modules" aria-label="专项训练分类">
          {practiceTracks.map((module) => {
            const moduleQuestions = questions.filter((q) =>
              module === '過去問演習'
                ? Boolean(examPeriodOfQuestion(q))
                : q.module === module,
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
                onClick={() => choosePracticeTrack(module)}
              >
                <span>
                  {module === '文字・語彙' && <BookOpen size={18} />}
                  {module === '文法' && <BrainCircuit size={18} />}
                  {module === '読解' && <NotebookPen size={18} />}
                  {module === '聴解' && <Headphones size={18} />}
                  {module === '過去問演習' && <Trophy size={18} />}
                </span>
                <div>
                  <b>{module}</b>
                  <small>
                    已完成 {completed}/{moduleQuestions.length} 题
                  </small>
                </div>
              </button>
            );
          })}
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
                          audioRef.current?.pause();
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
                    <option value={0.75}>0.75 倍</option>
                    <option value={1}>1 倍</option>
                    <option value={1.25}>1.25 倍</option>
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
                {q.audioSrc
                  ? '独立音频文件 · 可变速与重复播放 · 非 JLPT 官方录音'
                  : japaneseVoices.length
                    ? '高质量日语语音备用模式 · 非 JLPT 官方录音'
                    : '未检测到日语人声，将使用系统默认语音'}
              </p>
              {(q.transcript || q.context) && (
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
          {(q.transcript || q.context) &&
            q.module === '聴解' &&
            (showTranscript || checked) && (
              <div className="passage listening-transcript">
                {q.transcript || q.context}
              </div>
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
              {q.module === '読解' && q.context && (
                <div className="reading-map">
                  <span>问题/背景</span>
                  <i>→</i>
                  <span>常见观点</span>
                  <i>→</i>
                  <span>转折或限定</span>
                  <i>→</i>
                  <span>作者结论</span>
                  <small>本题依据：{q.explain}</small>
                </div>
              )}
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
      {doneCount === pool.length && pool.length > 0 && (
        <section className="session-report white-card">
          <div className="card-head">
            <div>
              <span className="kicker">SESSION REPORT</span>
              <h2>
                {mode === 'diagnostic'
                  ? '入学诊断报告'
                  : mode === 'mock'
                    ? '模拟考试报告'
                    : '本轮训练报告'}
              </h2>
            </div>
            <b>{Math.round((sessionCorrect / pool.length) * 100)}%</b>
          </div>
          <div className="report-metrics">
            <div>
              <span>正确题数</span>
              <b>
                {sessionCorrect}/{pool.length}
              </b>
            </div>
            <div>
              <span>平均速度</span>
              <b>
                {Math.round(
                  sessionRows.reduce((sum, row) => sum + row.seconds, 0) /
                    pool.length,
                )}{' '}
                秒
              </b>
            </div>
            <div>
              <span>会做但超时</span>
              <b>{slowCorrect} 题</b>
            </div>
            <div>
              <span>时间管理</span>
              <b>{slowCorrect >= 3 ? '需要优先训练' : '目前稳定'}</b>
            </div>
          </div>
          <p>
            {slowCorrect >= 3
              ? `你有 ${slowCorrect} 道题答对但超过建议时间，属于“知识会、速度不足”。下一轮优先进行限时训练。`
              : '本轮没有明显的“知识会但做不完”风险，继续关注错误类型。'}
          </p>
          <button className="solid" onClick={resetSession}>
            生成下一组
          </button>
        </section>
      )}
    </div>
  );
}

/** 专项训练顶部的五个分类入口，普通训练与历年真题共用。 */
function PracticeTrackTabs({
  activeTrack,
  onChooseTrack,
}: {
  activeTrack: PracticeTrack;
  onChooseTrack: (track: PracticeTrack) => void;
}) {
  return (
    <div className="practice-modules" aria-label="专项训练分类">
      {practiceTracks.map((track) => {
        const count = questions.filter((question) =>
          track === '過去問演習'
            ? Boolean(examPeriodOfQuestion(question))
            : question.module === track,
        ).length;
        return (
          <button
            key={track}
            className={activeTrack === track ? 'active' : ''}
            onClick={() => onChooseTrack(track)}
          >
            <span>
              {track === '文字・語彙' && <BookOpen size={18} />}
              {track === '文法' && <BrainCircuit size={18} />}
              {track === '読解' && <NotebookPen size={18} />}
              {track === '聴解' && <Headphones size={18} />}
              {track === '過去問演習' && <Trophy size={18} />}
            </span>
            <div>
              <b>{track}</b>
              <small>{count} 道可练真题</small>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** 历年真题训练：随机六题或整套真题都在同一页面作答，再统一判分。 */
function PastExamTraining({
  activeTrack,
  onChooseTrack,
  onSubmit,
}: {
  activeTrack: PracticeTrack;
  onChooseTrack: (track: PracticeTrack) => void;
  onSubmit: (attempt: Attempt) => void;
}) {
  const periods = useMemo(
    () =>
      [
        ...new Set(
          questions
            .map(examPeriodOfQuestion)
            .filter((period): period is string => Boolean(period)),
        ),
      ].sort((a, b) => {
        const value = (period: string) => {
          const [year, month] = period.match(/\d+/g)?.map(Number) || [0, 0];
          return year * 100 + month;
        };
        return value(b) - value(a);
      }),
    [],
  );
  const [period, setPeriod] = useState(periods[0] || '');
  const [examMode, setExamMode] = useState<'random' | 'full'>('full');
  const [seed, setSeed] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const fullPaper = useMemo(
    () =>
      questions
        .filter(
          (question) =>
            examPeriodOfQuestion(question) === period &&
            question.options.length >= 2,
        )
        .sort(
          (a, b) =>
            sourceQuestionOrder(a) - sourceQuestionOrder(b) || a.id - b.id,
        ),
    [period],
  );
  const randomPaper = useMemo(
    () =>
      [...fullPaper]
        .sort(
          (a, b) =>
            ((a.id * 9301 + seed) % 49297) - ((b.id * 9301 + seed) % 49297),
        )
        .slice(0, 6),
    [fullPaper, seed],
  );
  const paper = examMode === 'random' ? randomPaper : fullPaper;
  const answeredCount = paper.filter(
    (question) => answers[question.id] !== undefined,
  ).length;
  const correctCount = paper.filter(
    (question) => answers[question.id] === question.answer,
  ).length;

  /** 更换年月或训练模式时，清空本轮答案并重新开始计时。 */
  const restart = (
    nextPeriod = period,
    nextMode: 'random' | 'full' = examMode,
  ) => {
    setPeriod(nextPeriod);
    setExamMode(nextMode);
    setSeed(Date.now());
    setAnswers({});
    setSubmitted(false);
    setStartedAt(Date.now());
  };

  /**
   * 统一判分：整卷模式必须全部作答；随机模式答过一题即可提交，
   * 没有作答的题用 -1 记录，因此会自然计为错误并进入后续复习统计。
   */
  const submitPaper = () => {
    const canSubmit =
      examMode === 'full' ? answeredCount === paper.length : answeredCount >= 1;
    if (!canSubmit || submitted) return;
    const secondsPerQuestion = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 1000 / Math.max(paper.length, 1)),
    );
    paper.forEach((question) => {
      const chosen = answers[question.id] ?? -1;
      onSubmit({
        id: question.id,
        chosen,
        seconds: secondsPerQuestion,
        correct: chosen === question.answer,
      });
    });
    setSubmitted(true);
  };

  return (
    <div className="workspace past-exam-workspace">
      <div className="quiz-head">
        <div>
          <span className="kicker">专项训练</span>
          <h1>過去問演習</h1>
          <p>按考试年月练习已整理的 N1 真题，题干已去除页眉、页脚和水印。</p>
        </div>
        <div className="live-time">
          <Clock3 size={18} /> {period || '暂无真题'}
        </div>
      </div>

      <PracticeTrackTabs
        activeTrack={activeTrack}
        onChooseTrack={onChooseTrack}
      />

      <section className="exam-setup" aria-label="真题训练设置">
        <div>
          <b>真题年月</b>
          <select
            value={period}
            onChange={(event) => restart(event.target.value, examMode)}
          >
            {periods.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="exam-mode-switch">
          <b>训练模式</b>
          <button
            className={examMode === 'full' ? 'active' : ''}
            onClick={() => restart(period, 'full')}
          >
            本試験モード <small>完成整卷后统一判分</small>
          </button>
          <button
            className={examMode === 'random' ? 'active' : ''}
            onClick={() => restart(period, 'random')}
          >
            ランダム練習 <small>随机 6 题，至少答 1 题后确认</small>
          </button>
        </div>
        {examMode === 'full' && (
          <button
            className="regenerate print-paper-button"
            onClick={() => window.print()}
            title="打开打印窗口后可选择“另存为 PDF”"
          >
            <Printer size={15} /> 下载本卷 PDF
          </button>
        )}
        <button className="regenerate" onClick={() => restart()}>
          <RotateCcw size={15} /> 重新开始
        </button>
      </section>

      {!paper.length ? (
        <Empty text="该年月暂无可练题目" sub="请选择其他考试年月。" />
      ) : examMode === 'random' ? (
        <div className="full-paper random-paper">
          <header>
            <span>ランダム練習</span>
            <h2>{period} · 本组 6 题</h2>
            <p>
              已作答 {answeredCount}/{paper.length} 题 · 至少作答 1
              题后可统一确认
            </p>
          </header>
          {paper.map((question, questionIndex) => (
            <ExamQuestionCard
              key={question.id}
              question={question}
              ordinal={questionIndex + 1}
              chosen={answers[question.id]}
              showAnswer={submitted}
              showSharedMaterial={shouldShowSharedMaterial(
                paper,
                questionIndex,
              )}
              onChoose={(choice) =>
                !submitted &&
                setAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [question.id]: choice,
                }))
              }
            />
          ))}
          <footer className="exam-submit-bar">
            {submitted ? (
              <div className="exam-result">
                <b>
                  {correctCount} / {paper.length}
                </b>
                <span>本组正确题数</span>
                <button className="solid" onClick={() => restart()}>
                  生成下一组
                </button>
              </div>
            ) : (
              <>
                <p>
                  {answeredCount === 0
                    ? '请至少作答 1 题后再确认答案。'
                    : answeredCount === paper.length
                      ? '6 道题已全部完成，可以统一确认答案。'
                      : `还有 ${paper.length - answeredCount} 题未作答；现在确认将按做错处理。`}
                </p>
                <button
                  className="solid"
                  disabled={answeredCount === 0}
                  onClick={submitPaper}
                >
                  确认 6 道题答案
                </button>
              </>
            )}
          </footer>
        </div>
      ) : (
        <div className="full-paper">
          <header>
            <span>日本語能力試験 N1</span>
            <h2>{period} 過去問題</h2>
            <p>
              全 {paper.length} 問 · 已作答 {answeredCount} 問
            </p>
          </header>
          {paper.map((question, questionIndex) => (
            <ExamQuestionCard
              key={question.id}
              question={question}
              ordinal={questionIndex + 1}
              chosen={answers[question.id]}
              showAnswer={submitted}
              showSharedMaterial={shouldShowSharedMaterial(
                paper,
                questionIndex,
              )}
              onChoose={(choice) =>
                !submitted &&
                setAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [question.id]: choice,
                }))
              }
            />
          ))}
          <footer className="exam-submit-bar">
            {submitted ? (
              <div className="exam-result">
                <b>
                  {correctCount} / {paper.length}
                </b>
                <span>本次正确题数</span>
                <button className="solid" onClick={() => restart()}>
                  再做一次
                </button>
              </div>
            ) : (
              <>
                <p>
                  {answeredCount === paper.length
                    ? '全部题目已完成，可以交卷查看答案。'
                    : `还剩 ${paper.length - answeredCount} 题，全部完成后才能查看答案。`}
                </p>
                <button
                  className="solid"
                  disabled={answeredCount !== paper.length}
                  onClick={submitPaper}
                >
                  提交整卷并查看答案
                </button>
              </>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}

/** 为整卷和 6 题训练提供听力播放；声音由浏览器根据原文实时合成。 */
function ExamListeningPlayer({ question }: { question: Question }) {
  const [speaking, setSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const text = question.transcript || question.context || question.prompt;
  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };
  const play = () => {
    if (!('speechSynthesis' in window)) return;
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return (
    <div className="listening-player exam-listening-player">
      <div className="listen-main">
        <button className="audio-play" onClick={speaking ? stop : play}>
          {speaking ? <Square size={17} /> : <Volume2 size={19} />}
          {speaking ? '停止播放' : '播放日语语音'}
        </button>
        <button
          className="transcript-toggle"
          onClick={() => setShowTranscript((visible) => !visible)}
        >
          {showTranscript ? '隐藏文字稿' : '显示文字稿'}
        </button>
      </div>
      <p>根据听力原文生成的日语语音 · 非 JLPT 官方录音</p>
      {showTranscript && (
        <div className="passage listening-transcript">{text}</div>
      )}
    </div>
  );
}

/** 以干净的考试卷样式显示一道题；是否展示答案由训练模式决定。 */
function ExamQuestionCard({
  question,
  ordinal,
  chosen,
  showAnswer,
  showSharedMaterial = true,
  onChoose,
  children,
}: {
  question: Question;
  ordinal?: number;
  chosen?: number;
  showAnswer: boolean;
  showSharedMaterial?: boolean;
  onChoose: (choice: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="exam-question-card">
      <div className="q-meta">
        <span>{question.module}</span>
        <b>{question.type}</b>
        <em>{originalQuestionLabel(question) || `第 ${ordinal} 题`}</em>
      </div>
      {showSharedMaterial && question.context && question.module !== '聴解' && (
        <div className="passage">{question.context}</div>
      )}
      {showSharedMaterial && question.module === '聴解' && (
        <ExamListeningPlayer question={question} />
      )}
      <h2>{markedPrompt(question)}</h2>
      <div className={`answer-options ${optionLayoutClass(question)}`}>
        {question.options.map((option, optionIndex) => (
          <button
            key={`${question.id}-${optionIndex}`}
            disabled={showAnswer}
            onClick={() => onChoose(optionIndex)}
            className={`${chosen === optionIndex ? 'chosen ' : ''}${showAnswer && optionIndex === question.answer ? 'correct ' : ''}${showAnswer && chosen === optionIndex && optionIndex !== question.answer ? 'wrong' : ''}`}
          >
            <span>{optionIndex + 1}</span>
            {markedOption(question, option)}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div
          className={
            chosen === question.answer ? 'feedback good' : 'feedback bad'
          }
        >
          <b>{chosen === question.answer ? '回答正确' : '回答错误'}</b>
          <p>
            正确答案：{question.answerText || question.options[question.answer]}
          </p>
          <p>{question.explain}</p>
        </div>
      )}
      {children}
    </section>
  );
}

/** 单词本页面：按照序号、单词、读音和中文意思统一展示。 */
function VocabularyBook({
  entries,
  onAdd,
  onImport,
  onUpdate,
  onDedupe,
  onDelete,
}: {
  entries: VocabularyEntry[];
  onAdd: () => void;
  onImport: () => void;
  onUpdate: (entry: VocabularyEntry) => Promise<void>;
  onDedupe: () => Promise<number>;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ kana: '', meaning: '' });
  const [editingSaving, setEditingSaving] = useState(false);
  const [dedupeWorking, setDedupeWorking] = useState(false);
  const [dedupeNotice, setDedupeNotice] = useState('');
  const filtered = entries.filter((entry) =>
    `${entry.word} ${entry.kana} ${entry.meaning}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="workspace vocabulary-workspace">
      <div className="simple-title vocabulary-title">
        <div>
          <span className="kicker">词汇积累</span>
          <h1>单词本</h1>
          <p>可手动添加，也可在题目中选中日文后直接收录。</p>
        </div>
        <div className="vocabulary-title-actions">
          <button className="ghost" disabled={dedupeWorking || entries.length < 2} onClick={async () => {
            setDedupeWorking(true);
            try {
              const count = await onDedupe();
              setDedupeNotice(count ? `已清理 ${count} 条重复记录` : '没有发现重复单词');
              window.setTimeout(() => setDedupeNotice(''), 2600);
            } finally { setDedupeWorking(false); }
          }}>
            <Check size={17} /> {dedupeWorking ? '正在整理…' : '整理重复项'}
          </button>
          <button className="ghost" onClick={onImport}>
            <BookOpen size={17} /> 批量导入
          </button>
          <button className="solid" onClick={onAdd}>
            <Plus size={17} /> 手动添加
          </button>
        </div>
      </div>
      {dedupeNotice && <p className="vocabulary-dedupe-notice" role="status">{dedupeNotice}</p>}
      {entries.length > 0 && (
        <Input
          className="vocabulary-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索单词、读音或中文意思"
          aria-label="搜索单词本"
        />
      )}
      {entries.length === 0 ? (
        <Empty
          text="单词本还是空的"
          sub="点击“手动添加”，或在题目里选中想记住的日文。"
        />
      ) : filtered.length === 0 ? (
        <Empty text="没有找到相关单词" sub="换一个关键词试试。" />
      ) : (
        <div className="vocabulary-table-wrap">
          <table className="vocabulary-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">单词</th>
                <th scope="col">读音</th>
                <th scope="col">中文意思</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, index) => (
                <tr key={entry.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="单词" className="vocabulary-word">{entry.word}</td>
                  <td data-label="读音">
                    {editingId === entry.id ? (
                      <Input value={editDraft.kana} onChange={(event) => setEditDraft((draft) => ({ ...draft, kana: event.target.value }))} aria-label={`${entry.word}的读音`} />
                    ) : entry.kana}
                  </td>
                  <td data-label="中文意思">
                    <div className="vocabulary-meaning-cell">
                      {editingId === entry.id ? (
                        <Input value={editDraft.meaning} onChange={(event) => setEditDraft((draft) => ({ ...draft, meaning: event.target.value }))} aria-label={`${entry.word}的中文意思`} />
                      ) : <span>{entry.meaning}</span>}
                      <span className="vocabulary-row-actions">
                      {editingId === entry.id ? (
                        <>
                          <button className="vocabulary-edit" disabled={editingSaving || !editDraft.kana.trim() || !editDraft.meaning.trim()} onClick={async () => {
                            setEditingSaving(true);
                            try {
                              await onUpdate({ ...entry, kana: editDraft.kana.trim(), meaning: editDraft.meaning.trim(), updatedAt: new Date().toISOString() });
                              setEditingId(null);
                            } catch {
                              window.alert('保存失败，请稍后重试');
                            } finally { setEditingSaving(false); }
                          }} aria-label={`保存 ${entry.word}`} title="保存修改"><Save size={16} /></button>
                          <button className="vocabulary-edit" onClick={() => setEditingId(null)} aria-label="取消编辑" title="取消编辑"><X size={16} /></button>
                        </>
                      ) : (
                        <button className="vocabulary-edit" onClick={() => { setEditingId(entry.id); setEditDraft({ kana: entry.kana, meaning: entry.meaning }); }} aria-label={`编辑 ${entry.word}`} title="编辑读音和中文意思"><Pencil size={16} /></button>
                      )}
                      <button className="vocabulary-delete" onClick={() => { if (confirm(`确定从单词本删除「${entry.word}」吗？`)) onDelete(entry.id); }} aria-label={`删除 ${entry.word}`} title="删除这个词"><Trash2 size={16} /></button>
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** 错题本页面：提供筛选、逐题展开解析、复习状态和错误原因管理。 */
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
  const [masterNotice, setMasterNotice] = useState<{
    id: number;
    mastered: boolean;
  } | null>(null);
  const [reviewNotice, setReviewNotice] = useState<{
    id: number;
    quality: 'again' | 'hard' | 'easy';
    days: number;
  } | null>(null);
  const masterNoticeTimer = useRef<number | null>(null);
  const reviewNoticeTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (masterNoticeTimer.current)
        window.clearTimeout(masterNoticeTimer.current);
      if (reviewNoticeTimer.current)
        window.clearTimeout(reviewNoticeTimer.current);
    },
    [],
  );
  /** 点击选项时只展开这一题；再次点击同一选项则收起。 */
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
  /** 通过“收起答案解析”按钮关闭某一道题的完整信息。 */
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
  /** 从题目来源中提取“2025年12月”这样的真题批次。 */
  const sourcePeriod = (wrong: Wrong) => {
    const source = findQuestion(wrong.id)?.source;
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
  /** 只更新指定错题的部分信息，例如错误原因或掌握状态。 */
  const update = (id: number, patch: Partial<Wrong>) =>
    setWrongs(
      wrongs.map((w) =>
        w.id === id
          ? { ...w, ...patch, updatedAt: new Date().toISOString() }
          : w,
      ),
    );
  /** 切换掌握状态后立即显示按钮状态和短暂提示，让用户知道操作已保存。 */
  const toggleMastered = (wrong: Wrong) => {
    const mastered = !wrong.mastered;
    update(wrong.id, {
      mastered,
      nextReview: later(mastered ? 7 : 1),
    });
    setMasterNotice({ id: wrong.id, mastered });
    setReviewNotice(null);
    if (masterNoticeTimer.current)
      window.clearTimeout(masterNoticeTimer.current);
    masterNoticeTimer.current = window.setTimeout(
      () => setMasterNotice(null),
      2400,
    );
  };
  /** 按“忘记/模糊/熟练”调整间隔；不会删除或替换任何原错题。 */
  const review = (wrong: Wrong, quality: 'again' | 'hard' | 'easy') => {
    const current = wrong.reviewStage || 0;
    const stage =
      quality === 'again'
        ? 0
        : Math.min(4, current + (quality === 'easy' ? 2 : 1));
    const intervals =
      quality === 'again'
        ? 1
        : quality === 'hard'
          ? [1, 2, 4, 7, 14][stage]
          : [2, 4, 7, 14, 30][stage];
    update(wrong.id, {
      reviewStage: stage,
      reviewCount: (wrong.reviewCount || 0) + 1,
      lastReviewedAt: new Date().toISOString(),
      nextReview: later(intervals),
      mastered: quality === 'easy' && stage >= 4,
    });
    setMasterNotice(null);
    setReviewNotice({ id: wrong.id, quality, days: intervals });
    if (reviewNoticeTimer.current)
      window.clearTimeout(reviewNoticeTimer.current);
    reviewNoticeTimer.current = window.setTimeout(
      () => setReviewNotice(null),
      2400,
    );
  };
  // 同时应用掌握状态、真题年份和“今天到期”三个筛选条件。
  const filtered = wrongs.filter((wrong) => {
    const question = findQuestion(wrong.id);
    const statusOk =
      statusFilter === '全部' ||
      (statusFilter === '已掌握' ? wrong.mastered : !wrong.mastered);
    const yearOk = yearFilter === '全部' || sourcePeriod(wrong) === yearFilter;
    return (
      statusOk &&
      yearOk &&
      Boolean(question) &&
      (moduleFilter === '全部' || question?.module === moduleFilter)
    );
  });
  return (
    <div className="workspace">
      <div className="simple-title">
        <span className="kicker">自动收集</span>
        <h1>错题本</h1>
        <p>每次答错都会自动加入；请补充错误原因，系统会安排复习日期。</p>
      </div>
      {masterNotice && (
        <div className="master-toast" role="status" aria-live="polite">
          <Check size={18} strokeWidth={2.5} />
          <span>
            <b>{masterNotice.mastered ? '已标记为掌握' : '已重新加入复习'}</b>
            <small>
              {masterNotice.mastered
                ? '7 天后再次提醒，可随时撤销'
                : '明天将再次复习'}
            </small>
          </span>
        </div>
      )}
      {reviewNotice && (
        <div
          className={`master-toast review-toast ${reviewNotice.quality}`}
          role="status"
          aria-live="polite"
        >
          <Check size={18} strokeWidth={2.5} />
          <span>
            <b>
              {reviewNotice.quality === 'again'
                ? '已记录：忘记了'
                : reviewNotice.quality === 'hard'
                  ? '已记录：有点模糊'
                  : '已记录：熟练掌握'}
            </b>
            <small>
              {reviewNotice.days === 1
                ? '明天再练'
                : `复习间隔已调整为 ${reviewNotice.days} 天`}
            </small>
          </span>
        </div>
      )}
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
            const q = findQuestion(w.id);
            if (!q) return null;
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
                              reviewChoices[q.id] === index ? 'selected ' : ''
                            }${
                              individuallyRevealed && index === q.answer
                                ? 'correct '
                                : ''
                            }${
                              individuallyRevealed &&
                              reviewChoices[q.id] === index &&
                              index !== q.answer
                                ? 'wrong'
                                : ''
                            }`}
                            onClick={() => toggleReview(q.id, index)}
                            aria-expanded={individuallyRevealed}
                          >
                            {markedOption(q, option)}
                          </button>
                        ) : (
                          <span className="review-option-text">
                            {markedOption(q, option)}
                          </span>
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
                      className={`master ${w.mastered ? 'is-mastered' : ''}`}
                      aria-pressed={w.mastered}
                      onClick={() => toggleMastered(w)}
                    >
                      <Check size={14} strokeWidth={2.5} />
                      {w.mastered ? '已掌握 · 点击撤销' : '标记已掌握'}
                    </button>
                    <div className="review-rating" aria-label="复习结果">
                      <button
                        className={`again ${reviewNotice?.id === w.id && reviewNotice.quality === 'again' ? 'recorded' : ''}`}
                        aria-pressed={
                          reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'again'
                        }
                        onClick={() => review(w, 'again')}
                      >
                        忘记了
                        <small>
                          {reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'again'
                            ? '✓ 已记录'
                            : '明天再练'}
                        </small>
                      </button>
                      <button
                        className={`hard ${reviewNotice?.id === w.id && reviewNotice.quality === 'hard' ? 'recorded' : ''}`}
                        aria-pressed={
                          reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'hard'
                        }
                        onClick={() => review(w, 'hard')}
                      >
                        有点模糊
                        <small>
                          {reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'hard'
                            ? '✓ 已记录'
                            : '缩短间隔'}
                        </small>
                      </button>
                      <button
                        className={`easy ${reviewNotice?.id === w.id && reviewNotice.quality === 'easy' ? 'recorded' : ''}`}
                        aria-pressed={
                          reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'easy'
                        }
                        onClick={() => review(w, 'easy')}
                      >
                        熟练掌握
                        <small>
                          {reviewNotice?.id === w.id &&
                          reviewNotice.quality === 'easy'
                            ? '✓ 已记录'
                            : '延长间隔'}
                        </small>
                      </button>
                    </div>
                    <p className="review-meta">
                      已复习 {w.reviewCount || 0} 次 · 记忆阶段{' '}
                      {w.reviewStage || 0}/4
                    </p>
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

/** 根据真实作答估算三个科目的分数，并提示总分线和单科风险。 */
function Score({
  stats,
  attempts,
  go,
}: {
  stats: any;
  attempts: Attempt[];
  go: (x: string) => void;
}) {
  const speedPenalty = (moduleList: Module[]) => {
    const rows = attempts.filter((a) =>
      moduleList.includes(
        questions.find((q) => q.id === a.id)?.module as Module,
      ),
    );
    if (!rows.length) return 0;
    const slow = rows.filter(
      (a) =>
        a.seconds > (questions.find((q) => q.id === a.id)?.targetSec || 60),
    ).length;
    return Math.min(6, Math.round((slow / rows.length) * 8));
  };
  const modules = [
    [
      '语言知识',
      Math.max(
        0,
        Math.round(((stats.rates[0] + stats.rates[1]) / 2) * 0.6) -
          speedPenalty(['文字・語彙', '文法']),
      ),
    ],
    [
      '阅读',
      Math.max(0, Math.round(stats.rates[2] * 0.6) - speedPenalty(['読解'])),
    ],
    [
      '听力',
      Math.max(0, Math.round(stats.rates[3] * 0.6) - speedPenalty(['聴解'])),
    ],
  ];
  const enough = attempts.length >= 12;
  const total = modules.reduce((s, x) => s + Number(x[1]), 0);
  const margin = attempts.length >= 60 ? 5 : attempts.length >= 30 ? 9 : 14;
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
          text={`还差 ${12 - attempts.length} 道作答才能估算`}
          sub="至少完成 12 道不同模块的题目后生成趋势预测。"
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
              <small>
                预测区间 {Math.max(0, total - margin)}–
                {Math.min(180, total + margin)} · 已计入超时风险
              </small>
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

/** 学习数据页面：汇总各模块正确率、平均用时和常见错误原因。 */
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
  const weaknessMap = new Map<string, Attempt[]>();
  attempts.forEach((attempt) => {
    const q = questions.find((item) => item.id === attempt.id);
    if (!q) return;
    const key = `${q.module} · ${q.type}`;
    weaknessMap.set(key, [...(weaknessMap.get(key) || []), attempt]);
  });
  const weaknesses = [...weaknessMap.entries()]
    .map(([name, rows]) => ({
      name,
      score:
        (rows.filter((row) => row.correct).length / rows.length) * 100 -
        rows.reduce(
          (sum, row) =>
            sum +
            Math.max(
              0,
              row.seconds -
                (questions.find((q) => q.id === row.id)?.targetSec || 60),
            ),
          0,
        ) /
          rows.length,
      count: rows.length,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
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
          <section className="white-card weakness-card">
            <h2>当前弱点排行榜</h2>
            {weaknesses.map((item, index) => (
              <div className="weakness-row" key={item.name}>
                <b>{index + 1}</b>
                <span>
                  {item.name}
                  <small>{item.count} 次作答 · 同时考虑正确率和超时</small>
                </span>
                <em>优先复习</em>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

/** 只依据题库标准答案与解析回答，避免脱离教材内容编造结论。 */
function StudyAssistant({
  attempts,
  wrongs,
}: {
  attempts: Attempt[];
  wrongs: Wrong[];
}) {
  const candidateIds = [
    ...new Set([
      ...wrongs.map((w) => w.id),
      ...attempts.slice(-30).map((a) => a.id),
    ]),
  ];
  const candidates = candidateIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));
  const [questionId, setQuestionId] = useState(
    candidates[0]?.id || questions[0].id,
  );
  const [ask, setAsk] = useState('为什么其他选项不对？');
  const [answer, setAnswer] = useState('');
  const q = questions.find((item) => item.id === questionId) || questions[0];
  const respond = () => {
    const similar = questions
      .filter(
        (item) =>
          item.id !== q.id && item.module === q.module && item.type === q.type,
      )
      .slice(0, 5);
    if (/类似|出.*题|练习/.test(ask)) {
      setAnswer(
        similar.length
          ? `已从已校验题库找到 ${similar.length} 道同类题：${similar.map((item, index) => `${index + 1}. ${item.prompt}`).join('\n')}`
          : '当前标准题库中没有足够的同类题，不会临时编造未经校验的答案。',
      );
      return;
    }
    if (/主语|结构|逻辑|阅读/.test(ask)) {
      setAnswer(
        `${q.context ? `上下文：${q.context}\n` : ''}解题依据：${q.explain}\n逻辑定位：先找题目要求，再定位转折、结论或指示对象；本题正确答案是「${q.options[q.answer]}」。`,
      );
      return;
    }
    setAnswer(
      `标准答案：${q.options[q.answer]}\n教材解析：${q.explain}${q.distractorExplain ? `\n选项辨析：${q.distractorExplain}` : ''}${q.expansion ? `\n知识拓展：${q.expansion}` : ''}\n回答仅引用站内已校验题库，不把临时生成内容计入成绩。`,
    );
  };
  return (
    <div className="workspace">
      <div className="simple-title">
        <span className="kicker">GROUNDED COACH</span>
        <h1>AI 学习助手</h1>
        <p>先选择题目，再提问。回答严格以正确答案和站内教材解析为依据。</p>
      </div>
      <div className="assistant-layout">
        <section className="white-card assistant-source">
          <label>
            分析哪一道题
            <select
              value={questionId}
              onChange={(e) => {
                setQuestionId(Number(e.target.value));
                setAnswer('');
              }}
            >
              {(candidates.length ? candidates : questions.slice(0, 30)).map(
                (item) => (
                  <option key={item.id} value={item.id}>
                    {item.module} · {item.type} · {item.prompt.slice(0, 30)}
                  </option>
                ),
              )}
            </select>
          </label>
          {q.context && <p className="passage">{q.context}</p>}
          <h2>{q.prompt}</h2>
          <ol>
            {q.options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ol>
          <span className="source-lock">
            依据：{q.source || '一歩 N1 校验题库'} · 标准答案已锁定
          </span>
        </section>
        <section className="white-card coach-chat">
          <div className="quick-prompts">
            {[
              '为什么其他选项不对？',
              '帮我分析阅读逻辑',
              '这句话的主语是谁？',
              '给我 5 道类似题',
            ].map((text) => (
              <button key={text} onClick={() => setAsk(text)}>
                {text}
              </button>
            ))}
          </div>
          <textarea
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="输入你的问题"
          />
          <button className="solid" onClick={respond}>
            <MessageCircle size={16} /> 基于教材回答
          </button>
          {answer && (
            <div className="coach-answer">
              <b>一歩老师</b>
              <p>{answer}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** 多个页面共用的空状态提示，可附带一个继续操作按钮。 */
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
