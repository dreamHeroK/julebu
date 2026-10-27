import { h } from '../dom.js';
import { nav } from './nav.js';
import { PACKS } from '../data/courses.js';
import { overview, courseProgress, getState, updateSettings } from '../store.js';
import { fmtDuration, fmtNum } from '../core/scoring.js';

/** 包内下一课：第一节没练过的；都练过就挑第一节还没到 SSS 的；全 SSS 从头再来 */
export function nextCourse(pack) {
  return (
    pack.courses.find((c) => !courseProgress(pack.id, c.id)) ||
    pack.courses.find((c) => courseProgress(pack.id, c.id).best !== 'SSS') ||
    pack.courses[0]
  );
}

export function mountHome(root) {
  const ov = overview();
  let pack = PACKS.find((p) => p.id === getState().settings.pack) || PACKS[0];
  const startNext = () => {
    location.hash = `#/course/${pack.id}/${nextCourse(pack).id}`;
  };
  const practiceMs = ov.seconds;

  const statCell = (v, k) =>
    h('div', { class: 'stat-cell' }, [
      h('div', { class: 'v' }, v),
      h('div', { class: 'k' }, k),
    ]);

  const courseCard = (pack, course) => {
    const prog = courseProgress(pack.id, course.id);
    const badge = prog?.best
      ? h('span', { class: 'grade', 'data-g': prog.best }, prog.best)
      : h('span', { class: 'grade-dash' }, '未开始');

    return h(
      'button',
      {
        class: 'course-card',
        onclick: () => {
          location.hash = `#/course/${pack.id}/${course.id}`;
        },
      },
      [
        h('span', { class: 'course-idx' }, String(course.sentences.length)),
        h('span', { class: 'course-main' }, [
          h('span', { class: 'course-name' }, course.name),
          h(
            'span',
            { class: 'course-sub' },
            prog
              ? `${prog.plays} 次练习 · 最高 ${fmtNum(prog.lastScore)} 分`
              : `${course.sentences.length} 个句子 · 约 ${Math.round(
                  course.sentences.length * 0.4
                )} 分钟`
          ),
        ]),
        h('span', { class: 'course-badge' }, badge),
      ]
    );
  };

  const tabs = h(
    'div',
    { class: 'pack-tabs' },
    PACKS.map((p) =>
      h(
        'button',
        {
          class: 'pack-tab' + (p === pack ? ' active' : ''),
          onclick: (e) => {
            pack = p;
            updateSettings({ pack: p.id });
            tabs.querySelector('.active')?.classList.remove('active');
            e.currentTarget.classList.add('active');
            renderPack();
          },
        },
        p.title
      )
    )
  );

  const packSection = h('section', { class: 'pack' });
  function renderPack() {
    const nxt = nextCourse(pack);
    const done = pack.courses.filter((c) => courseProgress(pack.id, c.id)).length;
    packSection.replaceChildren(
      h('div', { class: 'pack-head' }, [
        h('span', { class: 'pack-title' }, pack.title),
        h('span', { class: 'pack-tag' }, pack.tag),
        h('span', { class: 'pack-meta' }, `${pack.desc} · 已学 ${done}/${pack.courses.length} 课`),
      ]),
      h('button', { class: 'btn btn-primary btn-sm pack-next', onclick: startNext }, `继续学习：${nxt.name} →`),
      h('div', { class: 'course-list' }, pack.courses.map((c) => courseCard(pack, c)))
    );
  }
  renderPack();

  const page = h('div', {}, [
    nav('home'),
    h('div', { class: 'container' }, [
      h('section', { class: 'hero' }, [
        h('h1', { html: '像玩游戏一样，<em>用句子学英语</em>' }),
        h(
          'p',
          {},
          '看中文，敲英文。连对越多，得分越高，Perfect 与连击一路冲上 SSS。'
        ),
        h('div', { class: 'hero-cta' }, [
          h(
            'button',
            {
              class: 'btn btn-primary',
              onclick: startNext,
            },
            '继续学习'
          ),
          h(
            'button',
            {
              class: 'btn btn-ghost',
              onclick: () => {
                location.hash = '#/review';
              },
            },
            ov.due > 0 ? `复习本（${ov.due}）` : '复习本'
          ),
        ]),
      ]),

      h('div', { class: 'stats-row' }, [
        statCell(ov.tracked, '已练句子'),
        statCell(`${ov.avgMastery}%`, '平均掌握度'),
        statCell(ov.due, '今日待复习'),
        statCell(fmtDuration(practiceMs), '累计练习'),
      ]),

      h('div', { class: 'section-head' }, [
        h('h2', {}, '课程'),
        h('span', { class: 'hint' }, '选一个课程包，点「继续学习」自动进入下一课，进度自动保存'),
      ]),

      tabs,
      packSection,

      h('div', { class: 'section-head' }, [
        h('h2', {}, '怎么玩'),
        h('span', { class: 'hint' }, '核心机制还原自 julebu.co'),
      ]),
      h(
        'div',
        { class: 'course-list' },
        [
          ['看中文，敲英文', '屏幕上只给中文和逐词的音标、词性、释义——拼写要自己打出来。'],
          ['首答正确才有 Perfect', '一次打对、不按退格、不看提示 = Perfect；退格过 = Great。'],
          ['连击越高分越高', '连对 3 次 +10%，5 次 +20%，7 次 +30%，10 次 +50%，15 次 +80%，20 次翻倍。'],
          ['SSS 才是真的会', '几乎每题都首答正确，评级才会冲到 SSS。'],
          ['自动安排复习', '练过的句子按间隔重复算法排队，到期就出现在复习本里。'],
        ].map(([t, d]) =>
          h('div', { class: 'card', style: { padding: '16px 18px' } }, [
            h('div', { style: { fontSize: '14px', fontWeight: '600' } }, t),
            h(
              'div',
              { style: { fontSize: '12.5px', color: 'var(--fg-dim)', marginTop: '6px', lineHeight: '1.65' } },
              d
            ),
          ])
        )
      ),

      h(
        'div',
        { style: { margin: '56px 0 0', textAlign: 'center', fontSize: '12px', color: 'var(--fg-faint)' } },
        '机制与视觉参考自 julebu.co，仅用于学习与技术研究。所有数据保存在你自己的浏览器里。'
      ),
    ]),
  ]);

  root.appendChild(page);
  return {};
}
