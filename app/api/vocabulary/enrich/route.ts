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

  try {
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
