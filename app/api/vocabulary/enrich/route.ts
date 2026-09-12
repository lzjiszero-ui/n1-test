type JishoSense = {
  english_definitions?: string[];
  parts_of_speech?: string[];
  tags?: string[];
  restrictions?: string[];
};
type JishoEntry = {
  japanese?: Array<{ word?: string; reading?: string }>;
  senses?: JishoSense[];
  jlpt?: string[];
  is_common?: boolean;
};
type JitenEntry = {
  text: string;
  rubyText?: string;
  partsOfSpeech?: string[];
  meanings?: string[];
  frequencyRank?: number;
};

const partOfSpeechLabels: Array<[RegExp, string]> = [
  [/noun/i, '名词'],
  [/ichidan|godan|suru verb|verb/i, '动词'],
  [/i-adjective/i, 'い形容词'],
  [/na-adjective/i, 'な形容词'],
  [/adverb/i, '副词'],
  [/expression/i, '固定表达'],
  [/conjunction/i, '接续词'],
  [/particle/i, '助词'],
  [/prefix/i, '接头词'],
  [/suffix/i, '接尾词'],
];

// 高频真题词的站内兜底资料；外部服务中断时也能完成常见词的收录。
const localEntries: Record<
  string,
  { kana: string; meaning: string; usage: string }
> = {
  軋轢: {
    kana: 'あつれき',
    meaning: '摩擦；不和；冲突',
    usage: '',
  },
  大抵: {
    kana: 'たいてい',
    meaning: '大抵；大多；通常',
    usage: '',
  },
  挫折: {
    kana: 'ざせつ',
    meaning: '挫折；受挫',
    usage: '',
  },
  逃避: {
    kana: 'とうひ',
    meaning: '逃避',
    usage: '',
  },
  模索: {
    kana: 'もさく',
    meaning: '摸索；探索',
    usage: '',
  },
  無個性: {
    kana: 'むこせい',
    meaning: '没有个性；缺乏个性',
    usage: '',
  },
  突っ張る: {
    kana: 'つっぱる',
    meaning: '撑住；顶住；逞强',
    usage: '',
  },
  いじける: {
    kana: 'いじける',
    meaning: '闹别扭；畏缩；变得消沉',
    usage: '',
  },
  採択: {
    kana: 'さいたく',
    meaning: '采纳；采用；通过',
    usage: '',
  },
  弁護士: {
    kana: 'べんごし',
    meaning: '律师',
    usage:
      '名词。指取得资格、为委托人提供法律咨询或代理诉讼的专业人士。常见于「弁護士に相談する」「弁護士として働く」。',
  },
  見落とす: {
    kana: 'みおとす',
    meaning: '看漏；忽略',
    usage:
      '他动词。用于因疏忽而没有注意到信息、问题或细节，常见搭配有「重要な点を見落とす」。',
  },
  目まぐるしい: {
    kana: 'めまぐるしい',
    meaning: '瞬息万变；令人眼花缭乱',
    usage:
      'い形容词。形容变化或活动非常快速、让人难以跟上，常用于「目まぐるしい変化」「目まぐるしい一日」。',
  },
  軌道: {
    kana: 'きどう',
    meaning: '轨道；既定路线',
    usage:
      '名词。既可指天体或车辆的轨道，也可比喻事情进入正常状态，如「事業が軌道に乗る」「計画を軌道修正する」。',
  },
  間柄: {
    kana: 'あいだがら',
    meaning: '关系；交情',
    usage:
      '名词。强调人与人之间的关系性质，常见于「親しい間柄」「家族同然の間柄」。',
  },
  閉鎖: {
    kana: 'へいさ',
    meaning: '关闭；封闭',
    usage:
      '名词、サ变动词。用于设施、道路、组织或网络空间停止开放，如「道路を閉鎖する」「閉鎖的な環境」。',
  },
  潜む: {
    kana: 'ひそむ',
    meaning: '潜藏；隐藏',
    usage:
      '自动词。表示人或事物藏在不易察觉之处，也常用于抽象风险，如「危険が潜む」「物陰に潜む」。',
  },
  躊躇: {
    kana: 'ちゅうちょ',
    meaning: '犹豫；踌躇',
    usage:
      '名词、サ变动词。表示因顾虑而无法立即行动，常见于「返事を躊躇する」「躊躇なく」。',
  },
};

/** 把词典中的英文说明转为学习者更容易理解的中文。 */
async function translateToChinese(text: string) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
      { headers: { accept: 'application/json' } },
    );
    if (response.ok) {
      const data = (await response.json()) as {
        responseData?: { translatedText?: string };
      };
      const translated = data.responseData?.translatedText?.trim();
      if (translated) return translated;
    }
  } catch {
    // 主翻译服务不可用时继续尝试备用通道。
  }
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`,
    );
    if (!response.ok) return '';
    const data = (await response.json()) as Array<Array<Array<string>>>;
    return (
      data[0]
        ?.map((part) => part[0])
        .join('')
        .trim() || ''
    );
  } catch {
    return '';
  }
}

/** 把“弁[べん]護[ご]士[し]”这样的注音格式还原成完整假名。 */
const readingFromRuby = (rubyText = '') =>
  rubyText.replace(/[一-龠々]+\[([^\]]+)\]/g, '$1').replace(/[\[\]]/g, '');

const romajiPairs: Record<string, string> = {
  kya: 'きゃ',
  kyu: 'きゅ',
  kyo: 'きょ',
  gya: 'ぎゃ',
  gyu: 'ぎゅ',
  gyo: 'ぎょ',
  sha: 'しゃ',
  shu: 'しゅ',
  sho: 'しょ',
  ja: 'じゃ',
  ju: 'じゅ',
  jo: 'じょ',
  cha: 'ちゃ',
  chu: 'ちゅ',
  cho: 'ちょ',
  nya: 'にゃ',
  nyu: 'にゅ',
  nyo: 'にょ',
  hya: 'ひゃ',
  hyu: 'ひゅ',
  hyo: 'ひょ',
  bya: 'びゃ',
  byu: 'びゅ',
  byo: 'びょ',
  pya: 'ぴゃ',
  pyu: 'ぴゅ',
  pyo: 'ぴょ',
  mya: 'みゃ',
  myu: 'みゅ',
  myo: 'みょ',
  rya: 'りゃ',
  ryu: 'りゅ',
  ryo: 'りょ',
  shi: 'し',
  chi: 'ち',
  tsu: 'つ',
  fu: 'ふ',
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  sa: 'さ',
  su: 'す',
  se: 'せ',
  so: 'そ',
  za: 'ざ',
  ji: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  ta: 'た',
  te: 'て',
  to: 'と',
  da: 'だ',
  de: 'で',
  do: 'ど',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  he: 'へ',
  ho: 'ほ',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ya: 'や',
  yu: 'ゆ',
  yo: 'よ',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  wa: 'わ',
  wo: 'を',
  n: 'ん',
};

/** 把翻译服务返回的 Hepburn 罗马字转换为平假名。 */
function romajiToHiragana(value: string) {
  let source = value.toLowerCase().replace(/[^a-z'-]/g, '');
  let result = '';
  while (source) {
    if (
      source.length > 1 &&
      source[0] === source[1] &&
      /[bcdfghjkmprstz]/.test(source[0])
    ) {
      result += 'っ';
      source = source.slice(1);
      continue;
    }
    if (source.startsWith("n'")) {
      result += 'ん';
      source = source.slice(2);
      continue;
    }
    const key = [3, 2, 1]
      .map((length) => source.slice(0, length))
      .find((part) => romajiPairs[part]);
    if (!key) {
      source = source.slice(1);
      continue;
    }
    result += romajiPairs[key];
    source = source.slice(key.length);
  }
  return result;
}

/** 单次请求同时取得中文释义和日文罗马字读音。 */
async function queryDirectTranslation(query: string) {
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=zh-CN&dt=t&dt=rm&q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as any[];
  const parts = Array.isArray(data[0]) ? data[0] : [];
  const meaning = parts
    .map((part: any[]) => (typeof part?.[0] === 'string' ? part[0] : ''))
    .join('')
    .trim();
  const romaji =
    parts.find((part: any[]) => typeof part?.[3] === 'string')?.[3] || '';
  const kana = romajiToHiragana(romaji);
  return meaning && kana ? { meaning, kana } : null;
}

/** 优先查询对云端更稳定的 JMdict 服务。 */
async function queryJiten(query: string) {
  const response = await fetch(
    `https://api.jiten.moe/api/vocabulary/search?query=${encodeURIComponent(query)}&limit=8`,
    { headers: { accept: 'application/json' } },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { results?: JitenEntry[] };
  return (
    data.results?.find((entry) => entry.text === query) ||
    data.results?.[0] ||
    null
  );
}

/** 根据用户输入的日文查询读音、含义和词典用法信息。 */
export async function POST(request: Request) {
  const body = (await request.json()) as { word?: string };
  const query = body.word?.trim();
  if (!query || query.length > 40 || !/[ぁ-んァ-ヶ一-龠々ー]/.test(query))
    return Response.json({ error: '请输入日文汉字或假名' }, { status: 400 });

  if (localEntries[query])
    return Response.json({ word: query, ...localEntries[query] });

  try {
    const direct = await queryDirectTranslation(query).catch(() => null);
    if (direct) {
      const kind = query.endsWith('する')
        ? 'サ变动词'
        : query.endsWith('い')
          ? '词汇或活用表达'
          : '名词或固定表达';
      return Response.json({
        word: query,
        kana: direct.kana,
        meaning: direct.meaning,
        usage: `词汇类型参考：${kind}。常用于表达“${direct.meaning}”的语境。具体词性、语气和搭配请结合收录时保留的原题语境理解。`,
      });
    }

    const jitenEntry = await queryJiten(query).catch(() => null);
    if (jitenEntry) {
      const definitions = (jitenEntry.meanings || []).slice(0, 6);
      const meaning = definitions.length
        ? await translateToChinese(definitions.join('; '))
        : '';
      const kana =
        readingFromRuby(jitenEntry.rubyText) ||
        (/^[ぁ-んァ-ヶー]+$/.test(query) ? query : '');
      if (kana && meaning) {
        const codes = jitenEntry.partsOfSpeech || [];
        const parts = [
          codes.some((code) => code === 'n' || code.startsWith('n-')) && '名词',
          codes.some((code) => code.startsWith('v')) && '动词',
          codes.some((code) => code.startsWith('adj-i')) && 'い形容词',
          codes.some((code) => code.startsWith('adj-na')) && 'な形容词',
          codes.some((code) => code.startsWith('adv')) && '副词',
          codes.some((code) => code === 'exp') && '固定表达',
        ].filter(Boolean);
        const usage = `${parts.length ? `词性：${parts.join('、')}。` : ''}常用于表达“${meaning}”的语境。${jitenEntry.frequencyRank ? `词频参考排名约 ${jitenEntry.frequencyRank}。` : ''}具体语气和搭配请结合收录时的原题语境理解。`;
        return Response.json({
          word: jitenEntry.text || query,
          kana,
          meaning,
          usage,
        });
      }
    }

    // 备用词典可补足部分生僻词或不同书写形式。
    const dictionaryResponse = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(query)}`,
      {
        headers: {
          accept: 'application/json',
          'user-agent': 'Ippo-N1-Study/1.0',
        },
      },
    );
    if (!dictionaryResponse.ok) throw new Error('dictionary unavailable');
    const dictionary = (await dictionaryResponse.json()) as {
      data?: JishoEntry[];
    };
    const entry =
      dictionary.data?.find((item) =>
        item.japanese?.some(
          (form) => form.word === query || form.reading === query,
        ),
      ) || dictionary.data?.[0];
    if (!entry)
      return Response.json(
        { error: '暂时没有查到这个词，请检查词形后重试' },
        { status: 404 },
      );

    const form =
      entry.japanese?.find(
        (item) => item.word === query || item.reading === query,
      ) || entry.japanese?.[0];
    const senses = (entry.senses || []).slice(0, 3);
    const definitions = [
      ...new Set(senses.flatMap((sense) => sense.english_definitions || [])),
    ].slice(0, 6);
    const translated = definitions.length
      ? await translateToChinese(definitions.join('; '))
      : '';
    const meaning = translated || definitions.join('；');
    if (!form?.reading || !meaning)
      return Response.json(
        { error: '词典资料不完整，请稍后重试' },
        { status: 502 },
      );

    const rawParts = [
      ...new Set(senses.flatMap((sense) => sense.parts_of_speech || [])),
    ];
    const parts = [
      ...new Set(
        partOfSpeechLabels
          .filter(([pattern]) => rawParts.some((item) => pattern.test(item)))
          .map(([, label]) => label),
      ),
    ];
    const notes = [
      ...new Set(
        senses.flatMap((sense) => [
          ...(sense.tags || []),
          ...(sense.restrictions || []),
        ]),
      ),
    ].slice(0, 2);
    const level =
      entry.jlpt?.[0]?.toUpperCase().replace('JLPT-', 'JLPT ') || '';
    const usage = [
      parts.length ? `词性：${parts.join('、')}。` : '',
      `常用于表达“${meaning}”的语境。`,
      entry.is_common ? '属于日语中的常用表达。' : '',
      level ? `词典标记：${level}。` : '',
      notes.length
        ? `使用提示：${notes.join('；')}。`
        : '具体语气和搭配请结合收录时的原题语境理解。',
    ]
      .filter(Boolean)
      .join('');

    return Response.json({
      word: form.word || query,
      kana: form.reading,
      meaning,
      usage,
    });
  } catch (error) {
    console.error('Vocabulary enrichment failed', error);
    return Response.json(
      { error: '自动查询暂时不可用，请稍后重试' },
      { status: 503 },
    );
  }
}
