import { h } from '../dom.js';
import { nav } from './nav.js';
import { PACKS } from '../data/courses.js';
import { overview, courseProgress, getState, updateSettings } from '../store.js';
import { fmtDuration } from '../core/scoring.js';

/** 包内下一课：第一节没练过的；都练过就挑第一节还没到 SSS 的；全 SSS 从头再来 */
export function nextCourse(pack) {
  return (
    pack.courses.find((c) => !courseProgress(pack.id, c.id)) ||
    pack.courses.find((c) => courseProgress(pack.id, c.id).best !== 'SSS') ||
    pack.courses[0]
  );
}

/** 首页分组；没列进来的新包自动归到最后一组 */
const GROUPS = [
  ['基础', ['daily', 'kids', 'grammar', 'vocabulary']],
  ['生活场景', ['travel', 'scenes', 'scene-food', 'scene-family', 'scene-transport', 'scene-school']],
  ['职场', ['work', 'dev', 'business', 'medical', 'finance']],
  ['考试与阅读', ['exam', 'cet', 'ielts', 'reading']],
];
export function groupPacks() {
  const listed = new Set(GROUPS.flatMap(([, ids]) => ids));
  const groups = GROUPS.map(([name, ids]) => [name, ids.map((id) => PACKS.find((p) => p.id === id)).filter(Boolean)]);
  groups[groups.length - 1][1].push(...PACKS.filter((p) => !listed.has(p.id)));
  return groups;
}

const go = (pack, course) => {
  location.hash = `#/course/${pack.id}/${course.id}`;
};
const doneCount = (pack) => pack.courses.filter((c) => courseProgress(pack.id, c.id)).length;

export function mountHome(root) {
  const ov = overview();
  let pack = PACKS.find((p) => p.id === getState().settings.pack) || PACKS[0];

  const continueCard = h('section', { class: 'home-next' });
  const courseBox = h('section', { class: 'home-courses' });
  const tiles = new Map();

  function render() {
    const nxt = nextCourse(pack);
    continueCard.replaceChildren(
      h('div', { class: 'home-next-main' }, [
        h('div', { class: 'home-next-k' }, '继续学习'),
        h('div', { class: 'home-next-t' }, `${pack.title} · ${nxt.name}`),
        h(
          'div',
          { class: 'home-next-s' },
          `已练 ${ov.tracked} 句 · 掌握度 ${ov.avgMastery}% · 累计 ${fmtDuration(ov.seconds)}`
        ),
      ]),
      h('button', { class: 'btn btn-primary', onclick: () => go(pack, nxt) }, '开始练习 →'),
      h(
        'button',
        { class: 'btn btn-ghost', onclick: () => (location.hash = '#/review') },
        ov.due > 0 ? `复习 ${ov.due} 句` : '复习本'
      )
    );

    courseBox.replaceChildren(
      h('div', { class: 'home-courses-head' }, `${pack.title} · ${pack.desc}`),
      h(
        'div',
        { class: 'home-course-grid' },
        pack.courses.map((c) => {
          const best = courseProgress(pack.id, c.id)?.best;
          return h('button', { class: 'home-course' + (c === nxt ? ' next' : ''), onclick: () => go(pack, c) }, [
            h('span', { class: 'home-course-name' }, c.name),
            best
              ? h('span', { class: 'grade', 'data-g': best }, best)
              : h('span', { class: 'grade-dash' }, `${c.sentences.length} 句`),
          ]);
        })
      )
    );

    tiles.forEach((el, p) => el.classList.toggle('active', p === pack));
  }

  const tile = (p) => {
    const done = doneCount(p);
    const el = h(
      'button',
      {
        class: 'home-pack',
        onclick: () => {
          pack = p;
          updateSettings({ pack: p.id });
          render();
        },
      },
      [
        h('span', { class: 'home-pack-t' }, p.title),
        h('span', { class: 'home-pack-s' }, `${done}/${p.courses.length}`),
        h('span', { class: 'home-pack-bar', style: { width: `${(done / p.courses.length) * 100}%` } }),
      ]
    );
    tiles.set(p, el);
    return el;
  };

  const page = h('div', {}, [
    nav('home'),
    h('div', { class: 'container home' }, [
      continueCard,
      h(
        'div',
        { class: 'home-groups' },
        groupPacks().map(([name, packs]) =>
          h('div', { class: 'home-group' }, [
            h('div', { class: 'home-group-k' }, name),
            h('div', { class: 'home-group-v' }, packs.map(tile)),
          ])
        )
      ),
      courseBox,
    ]),
  ]);

  render();
  root.appendChild(page);
  return {};
}
