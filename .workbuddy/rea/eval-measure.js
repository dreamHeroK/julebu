(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/life';
  await sleep(700);
  const ins = [...document.querySelectorAll('.wb-input')];
  return ins.map((i) => ({
    styleW: i.style.width,
    cssW: getComputedStyle(i).width,
    font: getComputedStyle(i).fontSize,
    box: i.getBoundingClientRect().width,
  }));
})();
