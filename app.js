let SUBJECTS, ENGLISH, FINANCIAL, CIVICS, LITERATURE;

async function loadData() {
  [SUBJECTS, ENGLISH, FINANCIAL, CIVICS, LITERATURE] = await Promise.all([
    fetch('subjects.json').then(r => r.json()),
    fetch('english.json').then(r => r.json()),
    fetch('financial.json').then(r => r.json()),
    fetch('civics.json').then(r => r.json()),
    fetch('literature.json').then(r => r.json())
  ]);

  initApp();
}

function initApp() {
  const $ = s => document.querySelector(s);

  const home = $('#home');
  const menu = $('#menu');
  const test = $('#test');
  const result = $('#result');
  const grid = $('#subjectGrid');
  const choiceGrid = $('#choiceGrid');

  let bank = [];
  let idx = 0;
  let selected = null;
  let correct = 0;
  let answered = 0;
  let time = 900;
  let tick = null;
  let ended = false;
  let currentSubject = '';
  let currentTest = '';
  let currentType = '';

  SUBJECTS.forEach(([icon, name, desc, color, type]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile ' + color;

    b.innerHTML =
      `<span class="icon">${icon}</span>` +
      `<span class="name">${name}</span>` +
      `<span class="desc">${desc}</span>`;

    b.addEventListener('click', () => openSubject(type, name));
    grid.appendChild(b);
  });

  function show(el) {
    [home, menu, test, result].forEach(x => x.classList.add('hidden'));
    el.classList.remove('hidden');
  }

  function openSubject(type, name) {
    if (type === 'soon') {
      alert('המקצוע ' + name + ' י
