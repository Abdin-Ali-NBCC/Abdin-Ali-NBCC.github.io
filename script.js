// ===== Edit your details here =====
const CONFIG = {
  email: 'you@example.com',
  links: [{ label: 'LinkedIn', url: '#' }, { label: 'GitHub', url: '#' }],
  projects: [
    { title: 'Project title one', meta: 'Category A · 2026', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#', color: 'mint' },
    { title: 'Project title two', meta: 'Category B · 2025', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#', color: 'pink' },
    { title: 'Project title three', meta: 'Category A · 2024', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#', color: 'blue' },
  ],
};
// ==================================

const $ = s => document.querySelector(s);
const root = document.documentElement;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
$('#year').textContent = new Date().getFullYear();

// Render projects as notes (click to open details)
$('#projects').innerHTML = CONFIG.projects.map(p => `
  <button class="note proj ${p.color}" aria-expanded="false">
    <div class="meta">${p.meta}</div><h3>${p.title}</h3><p>${p.summary}</p>
    <span class="tip">Click for details</span>
    <div class="more"><p>${p.details}</p><a href="${p.url}" target="_blank" rel="noopener">View project</a></div>
  </button>`).join('');
// the "more" area contains a link, so toggle on the note but not on the link itself
$('#projects').onclick = e => {
  const n = e.target.closest('.proj'); if (!n || e.target.closest('a')) return;
  if (n.dataset.moved) { delete n.dataset.moved; return; }
  const open = n.getAttribute('aria-expanded') === 'true';
  n.setAttribute('aria-expanded', !open);
  n.querySelector('.tip').textContent = open ? 'Click for details' : 'Click to close';
};

// Board colour
const set = c => { root.dataset.board = c; try { localStorage.setItem('board', c); } catch (e) {} };
try { set(localStorage.getItem('board') || 'teal'); } catch (e) { set('teal'); }
document.querySelectorAll('.swatches button').forEach(b => b.onclick = () => set(b.dataset.board));

// Notes: tilt, drag, keyboard nudge
const notes = [...document.querySelectorAll('.note')];
const tilts = [-1.5, 1.8, -1, 2, -2, 1.2, -1.6, 1, 1.7, -1.2];
notes.forEach((n, i) => { n.dataset.r = tilts[i % tilts.length]; n.style.setProperty('--r', n.dataset.r + 'deg'); n.dataset.x = 0; n.dataset.y = 0; n.tabIndex = 0; });
const place = n => { n.style.setProperty('--x', n.dataset.x + 'px'); n.style.setProperty('--y', n.dataset.y + 'px'); };
let z = 1, drag = null;
const canDrag = () => matchMedia('(hover:hover) and (min-width:721px)').matches;

notes.forEach(n => {
  n.addEventListener('pointerdown', e => {
    if (!canDrag() || e.button !== 0 || e.target.closest('a,input,textarea,label,.mail,.send')) return;
    drag = { n, sx: e.clientX, sy: e.clientY, ox: +n.dataset.x, oy: +n.dataset.y, moved: false };
    n.setPointerCapture(e.pointerId);
    n.style.zIndex = ++z;
  });
  n.addEventListener('pointermove', e => {
    if (!drag || drag.n !== n) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true; n.classList.add('drag');
    n.dataset.x = drag.ox + dx; n.dataset.y = drag.oy + dy; place(n);
  });
  const end = () => {
    if (!drag) return;
    drag.n.classList.remove('drag');
    if (drag.moved) drag.n.dataset.moved = '1';
    drag = null;
  };
  n.addEventListener('pointerup', end); n.addEventListener('pointercancel', end);
  n.addEventListener('keydown', e => {
    if (e.target !== n) return;
    const step = e.shiftKey ? 40 : 12, d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault(); n.dataset.x = +n.dataset.x + d[0]; n.dataset.y = +n.dataset.y + d[1]; place(n);
  });
});

$('#tidy').onclick = () => notes.forEach(n => { n.dataset.x = 0; n.dataset.y = 0; place(n); n.style.setProperty('--r', n.dataset.r + 'deg'); });
$('#shuffle').onclick = () => notes.forEach(n => n.style.setProperty('--r', (Math.random() * 7 - 3.5).toFixed(1) + 'deg'));

// Contact
$('#copy').textContent = CONFIG.email;
$('#copy').onclick = () => navigator.clipboard.writeText(CONFIG.email).then(() => toast('Email copied'), () => toast(CONFIG.email));
$('#links').innerHTML = CONFIG.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('');
$('#form').onsubmit = e => {
  e.preventDefault();
  const f = e.target;
  if (!f.checkValidity()) { $('#status').textContent = 'Please add your name, a valid email and a message.'; f.reportValidity(); return; }
  const s = encodeURIComponent(`Portfolio message from ${f.name.value}`);
  const b = encodeURIComponent(`${f.message.value}\n\nFrom: ${f.name.value} (${f.email.value})`);
  location.href = `mailto:${CONFIG.email}?subject=${s}&body=${b}`;
  $('#status').textContent = 'Opening your email app to send the message.';
};
