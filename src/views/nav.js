import { h } from '../dom.js';

/** 顶部导航 */
export function nav(active) {
  const link = (href, label, key) =>
    h(
      'a',
      {
        class: 'nav-link' + (active === key ? ' active' : ''),
        href,
      },
      label
    );

  return h('header', { class: 'nav' }, [
    h('div', { class: 'container nav-inner' }, [
      h('a', { class: 'brand', href: '#/' }, [
        h('span', { class: 'brand-mark' }, '句'),
        '句乐场',
      ]),
      h('nav', { class: 'nav-links' }, [
        link('#/', '课程', 'home'),
        link('#/review', '复习本', 'review'),
        link('#/profile', '学习档案', 'profile'),
      ]),
      h('div', { class: 'nav-right' }, [
        h('span', { class: 'nav-stat' }, '本地保存 · 无需登录'),
      ]),
    ]),
  ]);
}
