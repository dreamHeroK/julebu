(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/';
  await sleep(400);
  [...document.querySelectorAll('.course-card')]
    .find((c) => c.textContent.includes('课堂用语'))
    .click();
  await sleep(700);
  const plan = [
    ['May', 'I', 'come', 'in'],
    ['Open', 'your', 'books', 'to', 'page', 'ten'],
    ["I", "don't", 'understand', 'this', 'word'],
    ['Can', 'you', 'say', 'that', 'again', 'please'],
    ["Let's", 'read', 'the', 'text', 'together'],
  ];
  for (let i = 0; i < plan.length; i++) {
    for (const w of plan[i]) {
      for (const ch of w) key(ch);
      key(' ');
      await sleep(25);
    }
    await sleep(200);
    if (i < plan.length - 1) {
      key('Enter');
      await sleep(260);
    }
  }
  const ins = [...document.querySelectorAll('.wb-input')];
  const last = ins[ins.length - 1];
  const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  const dispatched = last.dispatchEvent(ev);
  const ae = document.activeElement;
  await sleep(500);
  return {
    inputs: ins.length,
    lastReadOnly: last.readOnly,
    activeIsLast: ae === last,
    activeTag: ae.tagName,
    prevented: ev.defaultPrevented,
    dispatched,
    panel: document.querySelectorAll('.result-backdrop').length,
    hint: document.querySelector('.hint-bar')?.textContent.replace(/\s+/g, ' ').slice(0, 50),
  };
})();
