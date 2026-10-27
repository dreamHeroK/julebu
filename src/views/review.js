import { h, clear } from '../dom.js';
import { nav } from './nav.js';
import { pickDue, dueLabel, mastery, INTERVALS } from '../core/srs.js';
import { srsPool, overview, getSrsItem } from '../store.js';
import { getSentence } from '../data/courses.js';
import { mountPractice } from './practice.js';

export function mountReview(root, opts = {}) {
  const rerender = opts.rerender || (() => {});
  const ov = overview();
  const dueItems = pickDue(srsPool(), 10);
  const dueSentences = dueItems.map((it) => getSentence(it.key)).filter(Boolean);

  const rows = dueItems
    .map((it) => ({ it, sent: getSentence(it.key) }))
    .filter((x) => x.sent)
    .map(({ it, sent }) =>
      h('div', { class: 'list-row' }, [
        h('div', { style: { minWidth: '0', flex: '1' } }, [
          h('div', { class: 'en' }, sent.en),
          h('div', { class: 'cn' }, sent.zh),
        ]),
        h('span', { class: 'pill' + (it.lapses > 0 ? ' warn' : '') }, `掌握 ${mastery(it)}%`),
        h('span', { class: 'due' }, dueLabel(it)),
      ])
    );

  const startPractice = () => {
    if (!dueSentences.length) return;
    clear(root);
    mountPractice(root, {
      sentences: dueSentences,
      title: '复习本',
      onExit: () => rerender(),
    });
  };

  const page = h('div', {}, [
    nav('review'),
    h('div', { class: 'container page' }, [
      h('h1', { class: 'page-title' }, '复习本'),
      h(
        'p',
        { class: 'page-sub' },
        '练过的句子会自动进来。答得越稳，下次复习的间隔越长；完全掌握后会「毕业」不再出现。'
      ),

      h('div', { class: 'review-hero' }, [
        h('div', { class: 'stat' }, [
          h('div', { class: 'big' }, ov.due),
          h('div', { class: 'cap' }, '今日推荐复习句数'),
        ]),
        h('div', { style: { width: '1px', height: '48px', background: '#2a2a31' } }),
        h('div', { class: 'stat' }, [
          h('div', { class: 'big', style: { color: 'var(--fg)' } }, `${ov.avgMastery}%`),
          h('div', { class: 'cap' }, '平均掌握度'),
        ]),
        h('div', { class: 'stat' }, [
          h('div', { class: 'big', style: { color: 'var(--green)' } }, ov.graduated),
          h('div', { class: 'cap' }, '已毕业'),
        ]),
        h('div', { style: { marginLeft: 'auto' } }, [
          h(
            'button',
            {
              class: 'btn btn-primary',
              disabled: !dueSentences.length,
              onclick: startPractice,
            },
            dueSentences.length ? `开始复习（${dueSentences.length}）` : '今天没有待复习'
          ),
        ]),
      ]),

      h('div', { class: 'section-head' }, [
        h('h2', {}, '今日推荐'),
        h('span', { class: 'hint' }, '答对得越干脆，间隔拉得越长（最长 180 天毕业）'),
      ]),

      dueItems.length
        ? h('div', { class: 'list' }, rows)
        : h(
            'div',
            { class: 'empty' },
            ov.tracked
              ? '今天的复习都清完了。去练几节新课，明天这里就会有推荐。'
              : '复习本还是空的 —— 先去练一节课，练过的句子会自动进来。'
          ),

      h('div', { class: 'section-head' }, [
        h('h2', {}, '间隔阶梯'),
        h('span', { class: 'hint' }, '答得越好，跳得越远'),
      ]),
      h(
        'div',
        { class: 'card', style: { padding: '18px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        [
          ...INTERVALS.map((d, i) =>
            h(
              'span',
              {
                style: {
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: i === 0 ? 'var(--purple-soft)' : '#1b1b1f',
                  color: i === 0 ? '#d5aaff' : 'var(--fg-dim)',
                  fontSize: '12.5px',
                  fontVariantNumeric: 'tabular-nums',
                },
              },
              `${d} 天`
            )
          ),
          h('span', { style: { fontSize: '12.5px', color: 'var(--fg-faint)', marginLeft: '6px' } }, '→ 毕业'),
        ]
      ),
    ]),
  ]);

  root.appendChild(page);
  return {};
}
