import { h, toast } from '../dom.js';
import { nav } from './nav.js';
import { overview, getState, resetAll } from '../store.js';
import { ALL_COURSES } from '../data/courses.js';
import { fmtDuration, fmtNum } from '../core/scoring.js';

export function mountProfile(root, opts = {}) {
  const rerender = opts.rerender || (() => {});
  const ov = overview();
  const state = getState();

  const kpi = (k, v) =>
    h('div', { class: 'kpi' }, [h('div', { class: 'k' }, k), h('div', { class: 'v' }, v)]);

  const started = ALL_COURSES.filter((c) => state.progress[`${c.packId}/${c.id}`]);

  const rows = started.map((c) => {
    const p = state.progress[`${c.packId}/${c.id}`];
    return h('div', { class: 'list-row' }, [
      h('div', { style: { flex: '1', minWidth: '0' } }, [
        h('div', { class: 'en' }, c.name),
        h('div', { class: 'cn' }, `${c.packTitle} · ${p.plays} 次练习 · ${fmtNum(p.lastScore)} 分`),
      ]),
      h('span', { class: 'grade', 'data-g': p.best }, p.best),
    ]);
  });

  const page = h('div', {}, [
    nav('profile'),
    h('div', { class: 'container page' }, [
      h('h1', { class: 'page-title' }, '学习档案'),
      h('p', { class: 'page-sub' }, '所有数据都存在本机浏览器，不上传、不需要账号。'),

      h('div', { class: 'kpi-grid' }, [
        kpi('已追踪句子', ov.tracked),
        kpi('平均掌握度', `${ov.avgMastery}%`),
        kpi('今日待复习', ov.due),
        kpi('已毕业', ov.graduated),
        kpi('完成练习次数', ov.sessions),
        kpi('累计练习时长', fmtDuration(ov.seconds)),
      ]),

      h('div', { class: 'section-head' }, [
        h('h2', {}, '课程进度'),
        h('span', { class: 'hint' }, started.length ? `${started.length} 节课有记录` : '还没有练习记录'),
      ]),
      started.length ? h('div', { class: 'list' }, rows) : h('div', { class: 'empty' }, '去练第一节课吧。'),

      h('div', { class: 'section-head' }, [h('h2', {}, '偏好设置')]),
      h('div', { class: 'card', style: { padding: '6px 20px' } }, [
        settingRow('连击动画', '连续答对 3 次以上时弹出 Perfect × N', state.settings.comboAnim, (v) => {
          updateSettings({ comboAnim: v });
        }),
        settingRow('音效', '打字、答对、连击的实时合成音效', state.settings.sound, (v) => {
          updateSettings({ sound: v });
          import('../core/sfx.js').then((m) => m.setSoundEnabled(v));
        }),
        settingRow('显示音标', '每个词上方显示 IPA 音标', state.settings.showIpa, (v) => {
          updateSettings({ showIpa: v });
        }),
        settingRow('朗读语速', `${state.settings.rate.toFixed(1)}x`, null, null, {
          type: 'range',
          value: state.settings.rate,
          onchange: (v) => {
            updateSettings({ rate: Number(v) });
            import('../core/speech.js').then((m) => m.setRate(Number(v)));
          },
        }),
      ]),

      h('div', { style: { marginTop: '36px' } }, [
        h(
          'button',
          {
            class: 'btn btn-ghost btn-sm',
            onclick: () => {
              if (!confirm('会清空所有课程进度和复习记录，确定吗？')) return;
              resetAll();
              toast('已清空');
              rerender();
            },
          },
          '清空所有数据'
        ),
      ]),
    ]),
  ]);

  root.appendChild(page);
  return {};

  function updateSettings(patch) {
    import('../store.js').then((m) => {
      m.updateSettings(patch);
    });
  }
}

function settingRow(title, desc, checked, onToggle, extra) {
  if (extra?.type === 'range') {
    const valEl = h('span', { class: 'dim', style: { fontSize: '12px', width: '34px', textAlign: 'right' } }, extra.value.toFixed(1) + 'x');
    const input = h('input', {
      type: 'range',
      min: '0.5',
      max: '2',
      step: '0.1',
      value: String(extra.value),
      style: { width: '120px', accentColor: 'var(--purple)' },
      oninput: (e) => {
        valEl.textContent = Number(e.target.value).toFixed(1) + 'x';
      },
      onchange: (e) => extra.onchange(e.target.value),
    });
    return h('div', { style: rowStyle }, [
      h('div', {}, [
        h('div', { style: { fontSize: '13.5px' } }, title),
        h('div', { style: { fontSize: '12px', color: 'var(--fg-faint)', marginTop: '3px' } }, desc || ''),
      ]),
      h('div', { style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' } }, [input, valEl]),
    ]);
  }

  let on = checked;
  const sw = h('button', {
    class: 'switch' + (on ? ' on' : ''),
    style: {
      width: '44px',
      height: '25px',
      borderRadius: '999px',
      background: on ? 'var(--purple)' : '#2c2c33',
      position: 'relative',
      transition: 'background .16s',
      flex: '0 0 auto',
    },
    onclick: () => {
      on = !on;
      sw.style.background = on ? 'var(--purple)' : '#2c2c33';
      dot.style.transform = on ? 'translateX(19px)' : 'translateX(0)';
      onToggle?.(on);
    },
  }, [
    h('span', {
      style: {
        position: 'absolute',
        top: '3px',
        left: '3px',
        width: '19px',
        height: '19px',
        borderRadius: '50%',
        background: '#fff',
        transition: 'transform .16s',
      },
    }),
  ]);
  const dot = sw.firstChild;

  return h('div', { style: rowStyle }, [
    h('div', {}, [
      h('div', { style: { fontSize: '13.5px' } }, title),
      h('div', { style: { fontSize: '12px', color: 'var(--fg-faint)', marginTop: '3px' } }, desc || ''),
    ]),
    h('div', { style: { marginLeft: 'auto' } }, [sw]),
  ]);
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 0',
  borderBottom: '1px solid var(--line-soft)',
};
