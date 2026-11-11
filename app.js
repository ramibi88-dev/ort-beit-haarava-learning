let SUBJECTS, ENGLISH, FINANCIAL, CIVICS;

async function loadData() {
  [SUBJECTS, ENGLISH, FINANCIAL, CIVICS] = await Promise.all([
    fetch('subjects.json').then(r => r.json()),
    fetch('english.json').then(r => r.json()),
    fetch('financial.json').then(r => r.json()),
    fetch('civics.json').then(r => r.json())
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
    b.innerHTML = `<span class="icon">${icon}</span><span class="name">${name}</span><span class="desc">${desc}</span>`;
    b.addEventListener('click', () => openSubject(type, name));
    grid.appendChild(b);
  });

  function show(el) {
    [home, menu, test, result].forEach(x => x.classList.add('hidden'));
    el.classList.remove('hidden');
  }

  function openSubject(type, name) {
    if (type === 'soon') {
      alert('המקצוע ' + name + ' ייפתח בהמשך.');
      return;
    }

    currentType = type;
    currentSubject = type === 'civics' ? 'אזרחות' : name;
    show(menu);

    $('#pageTitle').textContent =
      type === 'civics' ? '⚖️ אזרחות' :
      (type === 'english' ? '🇬🇧 ' : '💰 ') + name;

    $('#pageSub').textContent =
      type === 'english'
        ? 'בחרו רמת לימוד. בכל מבחן 15 שאלות ו-15 דקות.'
        : type === 'civics'
          ? 'בחרו נושא באזרחות. בכל מבחן 15 שאלות ו-15 דקות.'
          : 'בחרו נושא. לכל נושא מאגר עצמאי של 15 שאלות ו-15 דקות.';

    $('#menuTitle').textContent =
      type === 'english'
        ? 'בחירת רמת אנגלית'
        : type === 'civics'
          ? 'בחירת מבחן באזרחות'
          : 'בחירת נושא בחינוך פיננסי';

    $('#menuDesc').textContent = 'לחצו על הקובייה כדי להתחיל את המבחן.';
    choiceGrid.innerHTML = '';

    const data = type === 'english' ? ENGLISH : type === 'civics' ? CIVICS : FINANCIAL;
    const items = Array.isArray(data)
      ? data.map((exam, i) => [String(i), exam.title])
      : Object.keys(data).map(key => [key, key]);

    const classes = type === 'english'
      ? ['level3', 'level4', 'level5']
      : ['rights', 'payslip', 'budget', 'planning'];

    items.forEach(([key, label], i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice ' + classes[i % classes.length];
      b.innerHTML = `<span class="name">${label}</span><span class="desc">15 שאלות • 15 דקות • ציון אוטומטי</span>`;
      b.addEventListener('click', () => {
        const questions = Array.isArray(data)
          ? data[Number(key)].questions
          : data[key];
        startTest(label, questions);
      });
      choiceGrid.appendChild(b);
    });
  }

  function startTest(name, questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
      alert('לא נמצאו שאלות למבחן זה.');
      return;
    }

    currentTest = name;
    bank = questions.slice(0, 15);
    idx = 0;
    selected = null;
    correct = 0;
    answered = 0;
    time = 900;
    ended = false;

    show(test);
    $('#testTitle').textContent = currentSubject + ' • ' + name + ' • ' + bank.length + ' שאלות';
    $('#timer').classList.remove('warn');
    clearInterval(tick);
    draw();
    clock();
    tick = setInterval(clock, 1000);
  }

  function draw() {
    selected = null;
    $('#msg').textContent = '';
    const item = bank[idx];
    const total = bank.length;

    $('#counter').textContent = 'שאלה ' + (idx + 1) + ' מתוך ' + total;
    $('#fill').style.width = ((idx + 1) / total * 100) + '%';
    $('#question').textContent = item[0];

    const answers = $('#answers');
    answers.innerHTML = '';
    item[1].forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'answer';
      b.textContent = text;
      b.addEventListener('click', () => {
        selected = i;
        answers.querySelectorAll('.answer').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
      });
      answers.appendChild(b);
    });

    $('#next').textContent = idx === total - 1 ? 'סיום והצגת ציון' : 'לשאלה הבאה ←';
  }

  function submit() {
    if (selected === null) {
      $('#msg').textContent = 'יש לבחור תשובה לפני שממשיכים.';
      return;
    }

    answered++;
    if (selected === bank[idx][2]) correct++;

    if (idx === bank.length - 1) {
      finish(false);
    } else {
      idx++;
      draw();
    }
  }

  function clock() {
    const m = Math.floor(time / 60);
    const s = time % 60;
    $('#timer').textContent = '⏳ ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    if (time <= 180) $('#timer').classList.add('warn');
    if (time <= 0) {
      finish(true);
      return;
    }
    time--;
  }

  function finish(timeout) {
    if (ended) return;
    ended = true;
    clearInterval(tick);
    show(result);

    const total = bank.length || 15;
    const score = Math.round(correct / total * 100);
    $('#score').textContent = score;
    $('#summary').textContent =
      (timeout ? 'הזמן הסתיים. ' : '') +
      'ענית על ' + answered + ' מתוך ' + total + ' שאלות. תשובות נכונות: ' + correct + '.';
    $('#saveStatus').textContent = '';

    $('#saveResult').onclick = () => {
      const name = $('#studentName').value.trim();
      if (name.length < 2) {
        $('#saveStatus').textContent = 'יש להזין שם לפני השמירה.';
        return;
      }

      const records = JSON.parse(localStorage.getItem('ortResults') || '[]');
      records.push({
        name,
        subject: currentSubject,
        test: currentTest,
        score,
        correct,
        answered,
        date: new Date().toLocaleString('he-IL')
      });
      localStorage.setItem('ortResults', JSON.stringify(records));
      $('#saveStatus').textContent = '✅ התוצאה נשמרה בדפדפן במכשיר זה.';
    };
  }

  $('#backHome').addEventListener('click', () => {
    clearInterval(tick);
    show(home);
    $('#pageTitle').textContent = '🎓 מרכז הלמידה הבית־ספרי';
    $('#pageSub').textContent = 'בחרו מקצוע והתחילו ללמוד, לתרגל ולהתקדם';
  });

  $('#next').addEventListener('click', submit);
  $('#stop').addEventListener('click', () => finish(false));
  $('#again').addEventListener('click', () => openSubject(currentType, currentSubject));
}

loadData().catch(e => {
  document.querySelector('#pageSub').textContent =
    'שגיאה בטעינת מאגרי השאלות. יש להריץ את האתר דרך שרת/אחסון ולא בפתיחה ישירה של הקובץ.';
  console.error(e);
});
