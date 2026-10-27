(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(700);
  const ins = () => [...document.querySelectorAll('.wb-input')];
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );

  // 1) 打字 + 退格
  for (const ch of 'Nix') key(ch);
  await sleep(50);
  const a = { typed: ins()[0].value, focus: ins().indexOf(document.activeElement) };
  key('Backspace');
  await sleep(50);
  const b = { afterBs: ins()[0].value };

  // 2) Tab 提示
  key('Tab');
  await sleep(50);
  const c = { hinted: ins()[0].value };

  // 3) 补完第一词并提交
  key('e');
  key(' ');
  await sleep(60);
  const d = { done0: ins()[0].classList.contains('done'), focus: ins().indexOf(document.activeElement) };

  // 4) 空 buffer 退格 → 回到上一个词重新打
  key('Backspace');
  await sleep(80);
  const e = {
    focusBack: ins().indexOf(document.activeElement),
    done0: ins()[0].classList.contains('done'),
    val0: ins()[0].value,
    readOnly0: ins()[0].readOnly,
  };

  // 5) 空提交不该推进
  key(' ');
  await sleep(60);
  const f = { focus: ins().indexOf(document.activeElement) };

  return { a, b, c, d, e, f };
})();
