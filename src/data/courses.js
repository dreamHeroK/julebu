import { VOCAB_PACK } from './vocab.js';
import { EXTRA_PACKS } from './packs-extra.js';
import { CAREER_PACKS } from './packs-career.js';

/**
 * 课程内容
 * ---------------------------------------------------------------------------
 * 每条句子的数据结构：
 *   en  完整英文句子
 *   zh  整句中文
 *   w   逐词数组 [英文, 音标, 词性, 中文释义, 语块编号]
 *
 * 「语块编号」相同的相邻词在界面上会合并成一个彩色块（对应原站的语块着色）。
 * 词性/音标/释义三行提示是原站的核心设计：给你读音和意思，但不给拼写。
 */

function s(en, zh, words) {
  return {
    en,
    zh,
    w: words.map(([t, ipa, pos, cn, chunk]) => ({ t, ipa, pos, cn, chunk })),
  };
}

/** 课程包集合（词汇拓展来自 /learn 逆向资源，拓展包题材参考 /mall 课程包商城分类） */
export const PACKS = [
  {
    id: 'daily',
    title: '零基础日常',
    tag: '入门',
    desc: '从打招呼开始，把每天都会用到的句子练成肌肉记忆',
    courses: [
      {
        id: 'greet',
        name: '打招呼与自我介绍',
        sentences: [
          s('Nice to meet you.', '很高兴认识你。', [
            ['Nice', '/naɪs/', '形容词', '好的', 0],
            ['to', '/tuː/', '助词', '（不定式标记）', 0],
            ['meet', '/miːt/', '动词', '见到', 1],
            ['you', '/juː/', '代词', '你', 2],
          ]),
          s('I am a student from China.', '我是来自中国的学生。', [
            ['I', '/aɪ/', '代词', '我', 0],
            ['am', '/æm/', '动词', '是', 1],
            ['a', '/ə/', '限定词', '一个', 2],
            ['student', '/ˈstjuːdnt/', '名词', '学生', 2],
            ['from', '/frəm/', '介词', '来自', 3],
            ['China', '/ˈtʃaɪnə/', '名词', '中国', 3],
          ]),
          s('How are you doing today?', '你今天过得怎么样？', [
            ['How', '/haʊ/', '副词', '怎样', 0],
            ['are', '/ɑː/', '动词', '是', 1],
            ['you', '/juː/', '代词', '你', 1],
            ['doing', '/ˈduːɪŋ/', '动词', '做', 2],
            ['today', '/təˈdeɪ/', '副词', '今天', 3],
          ]),
          s('I am fine, thank you.', '我很好，谢谢你。', [
            ['I', '/aɪ/', '代词', '我', 0],
            ['am', '/æm/', '动词', '是', 1],
            ['fine', '/faɪn/', '形容词', '好的', 1],
            ['thank', '/θæŋk/', '动词', '感谢', 2],
            ['you', '/juː/', '代词', '你', 2],
          ]),
          s('See you tomorrow morning.', '明天早上见。', [
            ['See', '/siː/', '动词', '见到', 0],
            ['you', '/juː/', '代词', '你', 0],
            ['tomorrow', '/təˈmɒrəʊ/', '副词', '明天', 1],
            ['morning', '/ˈmɔːnɪŋ/', '名词', '早上', 1],
          ]),
        ],
      },
      {
        id: 'life',
        name: '日常生活',
        sentences: [
          s('I like to eat fresh apples every morning.', '我喜欢每天早上吃新鲜的苹果。', [
            ['I', '/aɪ/', '代词', '我', 0],
            ['like', '/laɪk/', '动词', '喜欢', 1],
            ['to', '/tuː/', '助词', '（不定式标记）', 2],
            ['eat', '/iːt/', '动词', '吃', 3],
            ['fresh', '/freʃ/', '形容词', '新鲜的', 4],
            ['apples', '/ˈæplz/', '名词', '苹果（复数）', 4],
            ['every', '/ˈevri/', '限定词', '每一个', 5],
            ['morning', '/ˈmɔːnɪŋ/', '名词', '早上', 5],
          ]),
          s('It is very important for me.', '这对我来说非常重要。', [
            ['It', '/ɪt/', '代词', '它', 0],
            ['is', '/ɪz/', '动词', '是', 1],
            ['very', '/ˈveri/', '副词', '非常', 2],
            ['important', '/ɪmˈpɔːtnt/', '形容词', '重要的', 2],
            ['for', '/fɔː/', '介词', '对于', 3],
            ['me', '/miː/', '代词', '我', 3],
          ]),
          s('She usually goes to work by bus.', '她通常坐公交车上班。', [
            ['She', '/ʃiː/', '代词', '她', 0],
            ['usually', '/ˈjuːʒuəli/', '副词', '通常', 1],
            ['goes', '/ɡəʊz/', '动词', '去', 2],
            ['to', '/tuː/', '介词', '到', 3],
            ['work', '/wɜːk/', '名词', '工作', 3],
            ['by', '/baɪ/', '介词', '乘坐', 4],
            ['bus', '/bʌs/', '名词', '公交车', 4],
          ]),
          s('We have dinner together at seven.', '我们七点一起吃晚饭。', [
            ['We', '/wiː/', '代词', '我们', 0],
            ['have', '/hæv/', '动词', '吃', 1],
            ['dinner', '/ˈdɪnə/', '名词', '晚餐', 1],
            ['together', '/təˈɡeðə/', '副词', '一起', 2],
            ['at', '/æt/', '介词', '在（某时刻）', 3],
            ['seven', '/ˈsevn/', '数词', '七点', 3],
          ]),
          s('The weather is getting colder.', '天气越来越冷了。', [
            ['The', '/ðə/', '限定词', '这个', 0],
            ['weather', '/ˈweðə/', '名词', '天气', 0],
            ['is', '/ɪz/', '动词', '正在', 1],
            ['getting', '/ˈɡetɪŋ/', '动词', '变得', 2],
            ['colder', '/ˈkəʊldə/', '形容词', '更冷的', 2],
          ]),
        ],
      },
    ],
  },
  ...EXTRA_PACKS,
  ...CAREER_PACKS,
  {
    id: 'grammar',
    title: '语法精讲',
    tag: '核心',
    desc: '把最容易错的句型和时态拆开，一句一句敲进脑子',
    courses: [
      {
        id: 'there-be',
        name: 'There be 句型',
        sentences: [
          s('There is a book on the desk.', '桌子上有一本书。', [
            ['There', '/ðeə/', '副词', '那里', 0],
            ['is', '/ɪz/', '动词', '有', 1],
            ['a', '/ə/', '限定词', '一本', 2],
            ['book', '/bʊk/', '名词', '书', 2],
            ['on', '/ɒn/', '介词', '在……上面', 3],
            ['the', '/ðə/', '限定词', '这个', 3],
            ['desk', '/desk/', '名词', '书桌', 3],
          ]),
          s('There are many students in the classroom.', '教室里有很多学生。', [
            ['There', '/ðeə/', '副词', '那里', 0],
            ['are', '/ɑː/', '动词', '有', 1],
            ['many', '/ˈmeni/', '限定词', '很多', 2],
            ['students', '/ˈstjuːdnts/', '名词', '学生（复数）', 2],
            ['in', '/ɪn/', '介词', '在……里面', 3],
            ['the', '/ðə/', '限定词', '这个', 3],
            ['classroom', '/ˈklɑːsruːm/', '名词', '教室', 3],
          ]),
          s('There is something wrong with my phone.', '我的手机出了点问题。', [
            ['There', '/ðeə/', '副词', '那里', 0],
            ['is', '/ɪz/', '动词', '有', 1],
            ['something', '/ˈsʌmθɪŋ/', '代词', '某事', 2],
            ['wrong', '/rɒŋ/', '形容词', '有毛病的', 2],
            ['with', '/wɪð/', '介词', '和……', 3],
            ['my', '/maɪ/', '限定词', '我的', 3],
            ['phone', '/fəʊn/', '名词', '手机', 3],
          ]),
          s('There will be a meeting tomorrow.', '明天会有一个会议。', [
            ['There', '/ðeə/', '副词', '那里', 0],
            ['will', '/wɪl/', '助动词', '将要', 1],
            ['be', '/biː/', '动词', '是', 2],
            ['a', '/ə/', '限定词', '一个', 3],
            ['meeting', '/ˈmiːtɪŋ/', '名词', '会议', 3],
            ['tomorrow', '/təˈmɒrəʊ/', '副词', '明天', 4],
          ]),
        ],
      },
      {
        id: 'tense',
        name: '时态：过去、完成、将来',
        sentences: [
          s('I have lived here for ten years.', '我在这里住了十年了。', [
            ['I', '/aɪ/', '代词', '我', 0],
            ['have', '/hæv/', '助动词', '已经', 1],
            ['lived', '/lɪvd/', '动词', '住', 2],
            ['here', '/hɪə/', '副词', '这里', 3],
            ['for', '/fɔː/', '介词', '长达', 4],
            ['ten', '/ten/', '数词', '十', 4],
            ['years', '/jɪəz/', '名词', '年', 4],
          ]),
          s('She was reading when I called.', '我打电话的时候她正在看书。', [
            ['She', '/ʃiː/', '代词', '她', 0],
            ['was', '/wɒz/', '助动词', '正在', 1],
            ['reading', '/ˈriːdɪŋ/', '动词', '读书', 2],
            ['when', '/wen/', '连词', '当……时', 3],
            ['I', '/aɪ/', '代词', '我', 4],
            ['called', '/kɔːld/', '动词', '打电话', 5],
          ]),
          s('They will arrive in Beijing tonight.', '他们今晚会到北京。', [
            ['They', '/ðeɪ/', '代词', '他们', 0],
            ['will', '/wɪl/', '助动词', '将要', 1],
            ['arrive', '/əˈraɪv/', '动词', '到达', 2],
            ['in', '/ɪn/', '介词', '在', 3],
            ['Beijing', '/ˌbeɪˈdʒɪŋ/', '名词', '北京', 3],
            ['tonight', '/təˈnaɪt/', '副词', '今晚', 4],
          ]),
          s('He has just finished his homework.', '他刚做完作业。', [
            ['He', '/hiː/', '代词', '他', 0],
            ['has', '/hæz/', '助动词', '已经', 1],
            ['just', '/dʒʌst/', '副词', '刚刚', 2],
            ['finished', '/ˈfɪnɪʃt/', '动词', '完成', 3],
            ['his', '/hɪz/', '限定词', '他的', 4],
            ['homework', '/ˈhəʊmwɜːk/', '名词', '作业', 4],
          ]),
        ],
      },
    ],
  },
  {
    id: 'ielts',
    title: '雅思口语',
    tag: '进阶',
    desc: '口语考试里高频出现的描述句，练到能脱口而出',
    courses: [
      {
        id: 'people',
        name: 'Part 2 · 描述一个人',
        sentences: [
          s('She is a person who never gives up.', '她是一个从不放弃的人。', [
            ['She', '/ʃiː/', '代词', '她', 0],
            ['is', '/ɪz/', '动词', '是', 1],
            ['a', '/ə/', '限定词', '一个', 2],
            ['person', '/ˈpɜːsn/', '名词', '人', 2],
            ['who', '/huː/', '代词', '（关系代词）', 3],
            ['never', '/ˈnevə/', '副词', '从不', 4],
            ['gives', '/ɡɪvz/', '动词', '放弃（give up）', 5],
            ['up', '/ʌp/', '副词', '向上', 5],
          ]),
          s('What impresses me most is her patience.', '最让我印象深刻的是她的耐心。', [
            ['What', '/wɒt/', '代词', '什么', 0],
            ['impresses', '/ɪmˈpresɪz/', '动词', '使印象深刻', 1],
            ['me', '/miː/', '代词', '我', 1],
            ['most', '/məʊst/', '副词', '最', 2],
            ['is', '/ɪz/', '动词', '是', 3],
            ['her', '/hɜː/', '限定词', '她的', 4],
            ['patience', '/ˈpeɪʃns/', '名词', '耐心', 4],
          ]),
          s('I would describe him as a reliable friend.', '我会把他描述成一个可靠的朋友。', [
            ['I', '/aɪ/', '代词', '我', 0],
            ['would', '/wʊd/', '助动词', '会', 1],
            ['describe', '/dɪˈskraɪb/', '动词', '描述', 2],
            ['him', '/hɪm/', '代词', '他', 3],
            ['as', '/əz/', '介词', '作为', 4],
            ['a', '/ə/', '限定词', '一个', 5],
            ['reliable', '/rɪˈlaɪəbl/', '形容词', '可靠的', 5],
            ['friend', '/frend/', '名词', '朋友', 5],
          ]),
          s('He always keeps his promises.', '他总是信守承诺。', [
            ['He', '/hiː/', '代词', '他', 0],
            ['always', '/ˈɔːlweɪz/', '副词', '总是', 1],
            ['keeps', '/kiːps/', '动词', '信守', 2],
            ['his', '/hɪz/', '限定词', '他的', 3],
            ['promises', '/ˈprɒmɪsɪz/', '名词', '承诺（复数）', 3],
          ]),
        ],
      },
    ],
  },
  VOCAB_PACK,
];

/** 结算页「今日金句」候选 */
export const QUOTES = [
  { en: 'Warmth shared comes back to you.', cn: '温暖的分享终将回馈于你。' },
  { en: 'An apple a day keeps the doctor away.', cn: '一天一个苹果，医生远离我。' },
  { en: 'Practice makes perfect.', cn: '熟能生巧。' },
  { en: 'Little by little, one travels far.', cn: '积跬步，以至千里。' },
  { en: 'The best time to plant a tree was twenty years ago.', cn: '种一棵树最好的时间是二十年前。' },
];

/* ------------------------------------------------------------------ */
/* 索引与查询                                                          */
/* ------------------------------------------------------------------ */

export const ALL_COURSES = PACKS.flatMap((p) =>
  p.courses.map((c) => ({ ...c, packId: p.id, packTitle: p.title, packTag: p.tag }))
);

/** 句子唯一 ID：pack/course#index */
export function sentenceKey(packId, courseId, index) {
  return `${packId}/${courseId}#${index}`;
}

const COURSE_MAP = new Map(ALL_COURSES.map((c) => [`${c.packId}/${c.id}`, c]));

export function getCourse(packId, courseId) {
  return COURSE_MAP.get(`${packId}/${courseId}`) || null;
}

/** 把课程转成练习单元列表 */
export function courseSentences(course) {
  return course.sentences.map((sent, i) => ({
    ...sent,
    key: sentenceKey(course.packId, course.id, i),
    packId: course.packId,
    courseId: course.id,
    courseName: course.name,
    index: i,
    total: course.sentences.length,
  }));
}

/** 通过 key 反查句子（复习本使用） */
const SENTENCE_MAP = new Map();
for (const c of ALL_COURSES) {
  c.sentences.forEach((sent, i) => {
    SENTENCE_MAP.set(sentenceKey(c.packId, c.id, i), {
      ...sent,
      key: sentenceKey(c.packId, c.id, i),
      packId: c.packId,
      courseId: c.id,
      courseName: c.name,
      index: i,
      total: c.sentences.length,
    });
  });
}
export function getSentence(key) {
  return SENTENCE_MAP.get(key) || null;
}

export const TOTAL_SENTENCES = SENTENCE_MAP.size;
