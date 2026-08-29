'use client';
import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  LayoutDashboard,
  MessageCircleMore,
  NotebookPen,
  Play,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
  TrendingUp,
} from 'lucide-react';

const tasks = [
  {
    icon: BrainCircuit,
    label: '今日词汇',
    detail: '近义词辨析 · 促す／催促する',
    time: 10,
    color: 'mint',
  },
  {
    icon: NotebookPen,
    label: '今日语法',
    detail: '逆接 · ～とはいえ／～ものの',
    time: 8,
    color: 'yellow',
  },
  {
    icon: BookOpen,
    label: '阅读训练',
    detail: '长文结构分析 · 社会评论',
    time: 7,
    color: 'blue',
  },
  {
    icon: TimerReset,
    label: '错题复习',
    detail: '5 道到期错题',
    time: 5,
    color: 'pink',
  },
];
const nav = [
  [LayoutDashboard, '今日学习'],
  [Target, '诊断测试'],
  [BrainCircuit, '专项训练'],
  [NotebookPen, '错题本'],
  [Trophy, '模拟考试'],
  [TrendingUp, '学习数据'],
] as const;

const featureInfo: Record<
  string,
  { title: string; sub: string; cards: string[][] }
> = {
  诊断测试: {
    title: '入学诊断测试',
    sub: '45 分钟看清知识与速度的真实短板',
    cards: [
      ['文字・語彙', '72%', '同义词辨析 45%'],
      ['文法', '68%', '逆接与语气薄弱'],
      ['読解', '61%', '长文平均超时 6 分钟'],
      ['聴解', '66%', '问题 3・4 正确率较低'],
    ],
  },
  专项训练: {
    title: 'N1 专项训练室',
    sub: '今天重点解决「会做，但做不完」',
    cards: [
      ['词汇辨析', '促す／催促する', '中文・日文释义与搭配'],
      ['语法接续', '逆接・限定・评价', '前接、语气、书面／口语'],
      ['长文结构', '观点 → 反驳 → 结论', '标记依据段落与转折'],
      ['听力精听', '课题・要点・概要', '逐句、字幕、听写与跟读'],
    ],
  },
  错题本: {
    title: '智能错题本',
    sub: '不只记答案，也找出反复出错的原因',
    cards: [
      ['逆接语法', '～からといって', '被选项迷惑 · 今天再测'],
      ['近义词辨析', '著しい／目覚ましい', '不认识单词 · 明天再测'],
      ['阅读主旨', '社会评论长文', '阅读速度慢 · 9月1日再测'],
      ['听力概要', '问题 4', '听力没听清 · 未掌握'],
    ],
  },
  模拟考试: {
    title: 'N1 分数模拟',
    sub: '参考 JLPT 评分逻辑，提前发现单科风险',
    cards: [
      ['语言知识', '38 / 60', '安全 · 单科线 19'],
      ['阅读', '34 / 60', '需提速 · 单科线 19'],
      ['听力', '36 / 60', '安全 · 单科线 19'],
      ['总分', '108 / 180', '超过合格线 8 分'],
    ],
  },
  学习数据: {
    title: '你的进步',
    sub: '比单次分数更重要的是持续变强的证据',
    cards: [
      ['连续学习', '12 天', '本周已学习 124 分钟'],
      ['预计得分', '+7 分', '近 4 周 +16 分'],
      ['综合掌握率', '68%', '比上周提高 6%'],
      ['平均速度', '-12% 用时', '阅读仍比合格者慢 18%'],
    ],
  },
};
function FeaturePage({
  active,
  onBack,
}: {
  active: string;
  onBack: () => void;
}) {
  const [run, setRun] = useState(false);
  const info = featureInfo[active];
  return (
    <div className="feature-page">
      <button className="back" onClick={onBack}>
        ← 返回今日学习
      </button>
      <div className="feature-title">
        <div>
          <span className="eyebrow">IPPO N1 · PERSONAL COACH</span>
          <h1>{info.title}</h1>
          <p>{info.sub}</p>
        </div>
        <div className="phase">
          <small>当前阶段</small>
          <b>分模块训练期</b>
          <span>距离考试 98 天</span>
        </div>
      </div>
      <div className="feature-grid">
        {info.cards.map(([name, value, note], i) => (
          <article className="feature-card card" key={name}>
            <span>0{i + 1}</span>
            <h3>{name}</h3>
            <b>{value}</b>
            <p>{note}</p>
            <div>
              <i style={{ width: `${78 - i * 8}%` }} />
            </div>
            <button>
              查看详情 <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>
      {active === '诊断测试' && (
        <section className="callout">
          <div>
            <span>AI 初步判断</span>
            <h2>你不是不会，而是速度拖累了得分。</h2>
            <p>
              系统会同时分析正确率、每题用时、薄弱题型，并识别“知识会但做不完”的问题。
            </p>
          </div>
          <button onClick={() => setRun(!run)}>
            {run ? '诊断进行中 · 02:14' : '开始 45 分钟诊断'}
          </button>
        </section>
      )}
      {active === '专项训练' && (
        <section className="demo card">
          <div className="demo-top">
            <span>词汇辨析 · 第 3 / 10 题</span>
            <b>00:42</b>
          </div>
          <h2>この制度の利用を市民に（　）ため、広報活動を強化した。</h2>
          <div className="demo-options">
            <button>催促する</button>
            <button className="selected">促す</button>
            <button>急かす</button>
          </div>
          <p>
            <b>促す：</b>
            自然地推动对方采取行动。常见搭配：注意を促す・参加を促す
          </p>
          <div className="listen-tools">
            <button>0.75×</button>
            <button className="selected">1.0×</button>
            <button>1.25×</button>
            <button>▶ 逐句播放</button>
            <button>● 跟读录音</button>
          </div>
        </section>
      )}
      {active === '错题本' && (
        <section className="reason-strip">
          <b>错误原因标签</b>
          {[
            '不认识单词',
            '语法不懂',
            '看错题目',
            '被选项迷惑',
            '阅读速度慢',
            '听力没听清',
            '时间不足',
            '粗心',
          ].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </section>
      )}
      {active === '模拟考试' && (
        <section className="risk">
          <b>✓ 当前达到合格线</b>
          <p>特别注意：即使总分超过 100，任何单科低于 19 分仍然不合格。</p>
          <button>开始 165 分钟整套模拟</button>
        </section>
      )}
      {active === '学习数据' && (
        <section className="trend card">
          <h2>8 周预计分数趋势</h2>
          <div className="bars">
            {[78, 82, 81, 89, 94, 99, 104, 108].map((v, i) => (
              <i key={i} style={{ height: `${v - 60}%` }}>
                <span>{v}</span>
              </i>
            ))}
          </div>
          <p>你正在稳定接近目标。最近提升最快：阅读指示词判断 +15%。</p>
        </section>
      )}
    </div>
  );
}

export default function Home() {
  const [done, setDone] = useState<number[]>([]);
  const [active, setActive] = useState('今日学习');
  const progress = Math.round((done.length / tasks.length) * 100);
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">一</span>
          <div>
            <b>一歩 N1</b>
            <small>合格まで、あと一歩。</small>
          </div>
        </div>
        <nav aria-label="主导航">
          {nav.map(([Icon, label]) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={active === label ? 'active' : ''}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === '错题本' && <em>12</em>}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="countdown">
            <span>JLPT N1 考试</span>
            <b>
              还有 <strong>98</strong> 天
            </b>
            <div>
              <i style={{ width: '38%' }} />
            </div>
            <small>分模块训练期 · 第 3 周</small>
          </div>
          <button className="assistant-link">
            <Sparkles size={18} /> AI 学习助手
          </button>
          <div className="profile">
            <span>刘</span>
            <div>
              <b>刘同学</b>
              <small>目标：2026 年 12 月</small>
            </div>
            <ChevronRight size={16} />
          </div>
        </div>
      </aside>
      <section className="content">
        <header className="topbar">
          <div className="mobile-brand">一歩 N1</div>
          <div className="streak">
            <Flame size={18} /> 连续学习 <b>12</b> 天
          </div>
          <button className="icon-button" aria-label="消息">
            ●
          </button>
        </header>
        {active !== "今日学习" ? (
          <FeaturePage active={active} onBack={() => setActive("今日学习")} />
        ) : (
        <div className="page">
          <div className="greeting">
            <div>
              <p>8月29日 · 星期六</p>
              <h1>下午好，刘同学。</h1>
              <span>今天的学习计划已经准备好了，一起完成吧。</span>
            </div>
            <div className="mini-goal">
              <Trophy size={22} />
              <div>
                <small>本周目标</small>
                <b>已学习 124 / 180 分钟</b>
              </div>
              <div className="ring">69%</div>
            </div>
          </div>
          <section className="score-card">
            <div className="score-intro">
              <span className="eyebrow">当前 N1 预计得分</span>
              <div>
                <strong>108</strong>
                <i>/ 180</i>
              </div>
              <p>
                <TrendingUp size={16} /> 比上次提高 <b>7 分</b>
              </p>
            </div>
            <div className="score-bars">
              {[
                ['语言知识', 38, 60, '#48b58a'],
                ['阅读', 34, 60, '#f0b84b'],
                ['听力', 36, 60, '#6d8fe8'],
              ].map(([label, val, max, color]) => (
                <div key={String(label)}>
                  <span>
                    {label}
                    <b>
                      {val}
                      <i> / {max}</i>
                    </b>
                  </span>
                  <div>
                    <i
                      style={{
                        width: `${(Number(val) / Number(max)) * 100}%`,
                        background: String(color),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pass-status">
              <Check size={16} />
              <div>
                <b>已达到合格线</b>
                <span>各科均高于 19 分</span>
              </div>
              <button>
                查看分析 <ArrowRight size={15} />
              </button>
            </div>
          </section>
          <div className="main-grid">
            <section className="plan-card card">
              <div className="section-head">
                <div>
                  <span className="eyebrow">DAILY PLAN</span>
                  <h2>今天的 30 分钟</h2>
                </div>
                <div className="plan-progress">
                  <b>{progress}%</b>
                  <span>
                    已完成 {done.length}/{tasks.length}
                  </span>
                </div>
              </div>
              <div className="plan-line">
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="tasks">
                {tasks.map((task, index) => {
                  const Icon = task.icon,
                    checked = done.includes(index);
                  return (
                    <button
                      key={task.label}
                      onClick={() =>
                        setDone(
                          checked
                            ? done.filter((x) => x !== index)
                            : [...done, index],
                        )
                      }
                      className={checked ? 'task done' : 'task'}
                    >
                      <span className={`task-icon ${task.color}`}>
                        <Icon size={20} />
                      </span>
                      <div>
                        <b>{task.label}</b>
                        <small>{task.detail}</small>
                      </div>
                      <span className="task-time">
                        <Clock3 size={14} />
                        {task.time} 分钟
                      </span>
                      <span className="check">
                        {checked && <Check size={15} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button className="primary-action">
                <Play size={17} fill="currentColor" /> 开始今日学习{' '}
                <span>预计 30 分钟</span>
              </button>
            </section>
            <aside className="right-stack">
              <section className="weak-card card">
                <div className="section-head">
                  <div>
                    <span className="eyebrow">WEAK POINTS</span>
                    <h2>现在最该补这里</h2>
                  </div>
                  <button>全部</button>
                </div>
                <div className="weak-list">
                  {[
                    ['01', 'N1 逆接语法', '正确率 48%', '文法'],
                    ['02', '新闻类词汇', '混淆 8 次', '词汇'],
                    ['03', '长文时间管理', '平均超时 6 分钟', '阅读'],
                  ].map(([n, title, sub, tag]) => (
                    <button key={n}>
                      <span>{n}</span>
                      <div>
                        <b>{title}</b>
                        <small>{sub}</small>
                      </div>
                      <em>{tag}</em>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </section>
              <section className="ai-card">
                <div className="ai-icon">
                  <MessageCircleMore size={22} />
                </div>
                <div>
                  <span>AI N1 学习助手</span>
                  <h3>哪里不明白，随时问我</h3>
                  <p>基于你的错题和教材内容回答</p>
                </div>
                <button aria-label="打开 AI 助手">
                  <ArrowRight size={18} />
                </button>
              </section>
            </aside>
          </div>
          <section className="insight">
            <div className="insight-icon">
              <Headphones size={22} />
            </div>
            <div>
              <span>今日学习洞察</span>
              <p>
                你的知识正确率已接近合格水平，但
                <strong>阅读速度比合格者慢 18%</strong>。建议今天优先完成 7
                分钟限时阅读。
              </p>
            </div>
            <button>
              开始限时训练 <ArrowRight size={15} />
            </button>
          </section>
        </div>
        )}
      </section>
    </main>
  );
}
