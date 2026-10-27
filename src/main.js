import { load, getState } from './store.js';
import { initSpeech, setRate } from './core/speech.js';
import { setSoundEnabled } from './core/sfx.js';
import { mountHome } from './views/home.js';
import { mountReview } from './views/review.js';
import { mountProfile } from './views/profile.js';
import { mountPractice } from './views/practice.js';
import { getCourse, courseSentences } from './data/courses.js';

const app = document.getElementById('app');
let current = null;

function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

function route() {
  if (current?.cleanup) {
    try {
      current.cleanup();
    } catch (e) {
      console.warn(e);
    }
  }
  current = null;
  app.innerHTML = '';
  document.querySelectorAll('.result-backdrop').forEach((n) => n.remove());

  const segs = (location.hash.replace(/^#/, '') || '/').split('/').filter(Boolean);

  if (segs[0] === 'course' && segs[1] && segs[2]) {
    const course = getCourse(segs[1], segs[2]);
    if (!course) {
      location.hash = '#/';
      return;
    }
    current = mountPractice(app, {
      sentences: courseSentences({ ...course, packId: course.packId }),
      title: course.name,
      packId: course.packId,
      courseId: course.id,
      onExit: () => go('#/'),
    });
  } else if (segs[0] === 'review') {
    current = mountReview(app, { rerender: route });
  } else if (segs[0] === 'profile') {
    current = mountProfile(app, { rerender: route });
  } else {
    current = mountHome(app);
  }

  window.scrollTo(0, 0);
}

/* ---------------- 启动 ---------------- */
load();
const st = getState();
setSoundEnabled(st.settings.sound);
initSpeech();
setRate(st.settings.rate);

window.addEventListener('hashchange', route);
route();

// 便于调试
window.__julebu = { route, go };
