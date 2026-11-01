export type JlptPdf = {
  period: string;
  label: string;
  filename: string;
};

/** input/jlpt 中的原始资料目录；PDF 文件本身未经任何修改。 */
export const jlptPdfs: JlptPdf[] = [
  { period: '2025年12月', label: '真题', filename: '2025年12月N1 真题.pdf' },
  { period: '2025年12月', label: '答案', filename: '2025年12月N1答案.pdf' },
  { period: '2025年12月', label: '听力原文', filename: '2025年12月N1听力原文.pdf' },
  { period: '2025年7月', label: '真题＋答案＋详解＋听力原文', filename: '2025年07月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2024年12月', label: '真题＋答案＋详解＋听力原文', filename: '2024年12月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2024年7月', label: '真题＋答案＋详解＋听力原文', filename: '2024年07月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2023年12月', label: '真题＋答案＋详解＋听力原文', filename: '2023年12月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2023年7月', label: '真题＋答案＋详解＋听力原文', filename: '2023年07月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2022年12月', label: '真题＋答案＋详解＋听力原文', filename: '2022年12月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2022年7月', label: '真题＋答案＋详解＋听力原文', filename: '2022年07月N1 真题+答案+详解+听力原文.pdf' },
  { period: '2021年12月', label: '真题＋答案＋详解＋听力原文', filename: '2021年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2021年7月', label: '真题＋答案＋详解＋听力原文', filename: '2021年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2020年12月', label: '真题＋答案＋详解＋听力原文', filename: '2020年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2019年12月', label: '真题＋答案＋详解＋听力原文', filename: '2019年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2019年7月', label: '真题＋答案＋详解＋听力原文', filename: '2019年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2018年12月', label: '真题＋答案＋详解＋听力原文', filename: '2018年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2018年7月', label: '真题＋答案＋详解＋听力原文', filename: '2018年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2017年12月', label: '真题＋答案＋详解＋听力原文', filename: '2017年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2017年7月', label: '真题＋答案＋详解＋听力原文', filename: '2017年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2016年12月', label: '真题＋答案＋详解＋听力原文', filename: '2016年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2016年7月', label: '真题＋答案＋详解＋听力原文', filename: '2016年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2015年12月', label: '真题＋答案＋详解＋听力原文', filename: '2015年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2015年7月', label: '真题＋答案＋详解＋听力原文', filename: '2015年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2014年12月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2014年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2014年7月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2014年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2013年12月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2013年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2013年7月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2013年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2012年12月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2012年12月N1真题+答案+详解+听力原文-1.pdf' },
  { period: '2012年7月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2012年7月N1真题+答案+详解+听力原文-2.pdf' },
  { period: '2011年12月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2011年12月N1真题+答案+详解+听力原文.pdf' },
  { period: '2011年7月', label: '真题＋答案＋详解＋听力原文', filename: 'Copy of 2011年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2010年7月', label: '真题资料 1', filename: 'Copy of 2010年7月N1真题+答案+详解+听力原文.pdf' },
  { period: '2010年7月', label: '真题资料 2', filename: 'Copy of 2010年7月N1真题+答案+详解+听力原文 2.pdf' },
];

export const jlptPdfPeriods = [...new Set(jlptPdfs.map((pdf) => pdf.period))];

const jlptPdfRepositoryBase =
  'https://raw.githubusercontent.com/lzjiszero-ui/n1-test/main/assets/jlpt';

export const jlptPdfUrl = (filename: string) =>
  `${jlptPdfRepositoryBase}/${encodeURIComponent(filename)}`;

export const jlptAnswerSheetUrl = jlptPdfUrl('N1答题卡.pdf');
