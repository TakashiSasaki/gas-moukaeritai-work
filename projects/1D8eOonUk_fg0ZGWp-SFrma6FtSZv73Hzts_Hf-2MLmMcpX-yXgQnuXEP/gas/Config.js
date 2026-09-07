// ==========================================
// Config.gs
// 施設情報とプロンプト生成ロジックの定義
// ==========================================

// モデルの定義
const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";
const AVAILABLE_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-pro-preview"
];

// 施設データ
const FACILITY_CONFIG = {
  1: { 
    name: "愛媛県美術館", 
    urls: [
      "https://www.ehime-art.jp/",
      "https://www.ehime-art.jp/exhibition/rental.html"
    ],
    extra_instruction: "貸しギャラリーでの展示情報も必ず含めてください。この施設のデフォルトのテーマカラーは #235633 です。"
  },
  2: { 
    name: "萬翠荘（ばんすいそう）", 
    urls: [
      "https://www.bansuisou.org/",
      "https://www.bansuisou.org/event/index.html"
    ],
    extra_instruction: "展示やコンサート、単日、短時間のイベントも漏れなくすべて含めてください。この施設のデフォルトのテーマカラーは #a97f71 です。"
  },
  3: { 
    name: "坂の上の雲ミュージアム", 
    urls: [
      "https://www.sakanouenokumomuseum.jp/event/event/",
      "https://www.sakanouenokumomuseum.jp/",
      "https://www.sakanouenokumomuseum.jp/display/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #7bc6fa です。"
  },
  4: { 
    name: "松山市立子規記念博物館", 
    urls: [
      "https://shiki-museum.com/",
      "https://shiki-museum.com/event/",
      "https://shiki-museum.com/information/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #7c4846 です。"
  },
  5: { 
    name: "道後公園 湯築城跡", 
    urls: [
      "https://dogokouen.jp/",
      "https://dogokouen.jp/event/",
      "https://dogokouen.jp/event/other/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #d58e53 です。"
  },
  6: { 
    name: "ミウラート・ヴィレッジ（三浦美術館）", 
    urls: [
      "https://www.miuraz.co.jp/miurart/",
      "https://www.miuraz.co.jp/miurart/main/",
      "https://www.miuraz.co.jp/miurart/info/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #a6373e です。"
  },
  7: { 
    name: "セキ美術館", 
    urls: [
      "https://www.seki.co.jp/mus/",
      "https://www.seki.co.jp/mus/contents/exhibit"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #e5d6cd です。"
  },
  8: { 
    name: "秋山兄弟生誕地", 
    urls: [
      "https://akiyama-kyodai.gr.jp/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #fba9ab です。"
  },
  9: { 
    name: "松山城 二之丸史跡庭園", 
    urls: [
      "https://www.matsuyamajo.jp/ninomaru/",
      "https://www.matsuyamajo.jp/event/",
      "https://www.matsuyamajo.jp/annualevents/",
      "https://www.matsuyamajo.jp/event/castle/",
      "https://www.matsuyamajo.jp/info/"
    ],
    extra_instruction: "この施設のデフォルトのテーマカラーは #1c2d70 です。"
  },
  10: { 
    name: "愛媛大学ミュージアム", 
    urls: [
      "https://www.ehime-u.ac.jp/about/ehime-u-museum/",
      "https://www.ehime-u.ac.jp/data_event/?start_date=&end_date=&s_cat%5B%5D=125&s_title=&s_type=all",
      "https://www.ehime-u.ac.jp/data_event/?s_cat[]=125",
      "https://www.facebook.com/EhimeUniversityMuseum/",
      "https://calendar.google.com/calendar/ical/ehimeuniversitymuseum%40gmail.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/g1bfonf9nlh5864t9esdl51q5g%40group.calendar.google.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/qgg53lk80276hr47dqsov463ts%40group.calendar.google.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/gita8i9or738actckej97dhq70%40group.calendar.google.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/n3cl14p064oh4htrdi5qiel790%40group.calendar.google.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/3i3h6inivi534ts4dib7dp7c2g%40group.calendar.google.com/public/basic.ics",
      "https://calendar.google.com/calendar/ical/vatb8njlusin7ifatop1putnf0%40group.calendar.google.com/public/basic.ics"
    ],
    extra_instruction: "ギャラリートークの情報は不要です。この施設のデフォルトのテーマカラーは #aea356 です。開催場所が愛媛大学あるいは愛媛大学ミュージアムあるいは愛大ミューズのものだけを出力に含めて下さい。"
  }
};

function buildPrompt(pageId) {
  const config = FACILITY_CONFIG[pageId];
  if (!config) return "";
  let prompt = `${config.name}の今後の展示・イベントスケジュールを取得し、一覧できるウェブページを作成してください。\n\n`;
  prompt += `【対象URL】\n${config.urls.join("\n")}\n\n`;
  if (config.extra_instruction) {
    prompt += `【個別要件】\n${config.extra_instruction}`;
  }
  return prompt;
}