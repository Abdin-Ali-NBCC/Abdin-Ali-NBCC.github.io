// ===== Edit your details here =====
const CONFIG = {
  email: 'you@example.com',
  status: 'Open to work',
  links: [{ label: 'LinkedIn', url: '#' }, { label: 'GitHub', url: '#' }],
  projects: [
    { title: 'Project title one', meta: 'Category A · 2026', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#' },
    { title: 'Project title two', meta: 'Category B · 2025', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#' },
    { title: 'Project title three', meta: 'Category A · 2024', summary: 'One line on the problem you solved and the result.', details: 'Longer description: your role, the tools you used, and the outcome.', url: '#' },
  ],
};
// ==================================

const $ = s => document.querySelector(s);
const root = document.documentElement;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
$('#year').textContent = new Date().getFullYear();
$('#status').textContent = CONFIG.status;

// ---- The aura: soft glowing light that follows the pointer ----
const PALETTES = {
  blue:   [[76, 111, 255], [120, 90, 255], [60, 190, 255]],
  violet: [[154, 100, 255], [100, 70, 230], [210, 130, 255]],
  aqua:   [[62, 224, 255], [40, 150, 235], [110, 255, 215]],
};
const cv = $('#aura'), ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const S = 0.25;
let W, H, cur = PALETTES.blue.map(c => [...c]), target = PALETTES.blue;
const ptr = { x: innerWidth * 0.65, y: innerHeight * 0.35 }, pos = { x: ptr.x, y: ptr.y };
const size = () => { W = cv.width = Math.ceil(innerWidth * S); H = cv.height = Math.ceil(innerHeight * S); };
size(); addEventListener('resize', () => { size(); frame(0); });
addEventListener('pointermove', e => { ptr.x = e.clientX; ptr.y = e.clientY; });

function frame(t) {
  pos.x += (ptr.x - pos.x) * 0.06; pos.y += (ptr.y - pos.y) * 0.06;
  cur.forEach((c, i) => c.forEach((v, k) => c[k] = v + (target[i][k] - v) * 0.05));
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#05060B'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const R = Math.max(W, H) * 0.42, sy = -scrollY * S * 0.25, s = t / 1000;
  const blobs = [
    [pos.x * S, pos.y * S + sy * 0.4, R * 0.9, cur[0], 0.55],
    [W * (0.25 + 0.12 * Math.sin(s * 0.35)), H * (0.35 + 0.15 * Math.cos(s * 0.28)) + sy, R, cur[1], 0.32],
    [W * (0.8 + 0.1 * Math.cos(s * 0.3)), H * (0.7 + 0.12 * Math.sin(s * 0.4)) + sy, R * 1.1, cur[2], 0.28],
  ];
  blobs.forEach(([x, y, r, c, a]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r), col = c.map(Math.round).join(',');
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
  if (!reduce) requestAnimationFrame(frame);
}
frame(0); if (!reduce) requestAnimationFrame(frame);

const setAura = name => {
  target = PALETTES[name];
  root.style.setProperty('--a', `rgb(${target[0].join(',')})`);
  document.querySelectorAll('.swatches button').forEach(b => b.setAttribute('aria-pressed', b.dataset.aura === name));
  try { localStorage.setItem('aura', name); } catch (e) {}
  if (reduce) { cur = target.map(c => [...c]); frame(0); }
};
document.querySelectorAll('.swatches button').forEach(b => b.onclick = () => setAura(b.dataset.aura));
let saved = 'blue'; try { saved = localStorage.getItem('aura') || 'blue'; } catch (e) {}
setAura(PALETTES[saved] ? saved : 'blue'); cur = target.map(c => [...c]);

// ---- Nav ----
const nav = $('#nav'), menu = $('#menu');
menu.onclick = () => menu.setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.onclick = e => { if (e.target.tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } };
const links = [...nav.querySelectorAll('a')], secs = links.map(a => $(a.getAttribute('href')));
addEventListener('scroll', () => {
  let c = '';
  secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.45) c = '#' + s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === c));
}, { passive: true });

// ---- Projects: glowing cards + details dialog ----
const grid = $('#projects'), dlg = $('#dlg');
grid.innerHTML = CONFIG.projects.map((p, i) => `<button class="card" data-i="${i}"><span class="m">${p.meta}</span><h3>${p.title}</h3><p>${p.summary}</p></button>`).join('');
grid.addEventListener('pointermove', e => {
  const c = e.target.closest('.card'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
grid.onclick = e => {
  const c = e.target.closest('.card'); if (!c) return;
  const p = CONFIG.projects[c.dataset.i];
  $('#dmeta').textContent = p.meta; $('#dt').textContent = p.title; $('#dd').textContent = p.details; $('#dlink').href = p.url;
  dlg.showModal();
};
$('#close').onclick = () => dlg.close();
dlg.onclick = e => { if (e.target === dlg) dlg.close(); };

// ---- Contact ----
$('#copy').textContent = CONFIG.email;
$('#copy').onclick = () => navigator.clipboard.writeText(CONFIG.email).then(() => toast('Email copied'), () => toast(CONFIG.email));
$('#links').innerHTML = CONFIG.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('');
$('#form').onsubmit = e => {
  e.preventDefault();
  const f = e.target;
  if (!f.checkValidity()) { $('#fstatus').textContent = 'Add your name, a valid email and a message.'; f.reportValidity(); return; }
  const s = encodeURIComponent(`Portfolio message from ${f.name.value}`);
  const b = encodeURIComponent(`${f.message.value}\n\nFrom: ${f.name.value} (${f.email.value})`);
  location.href = `mailto:${CONFIG.email}?subject=${s}&body=${b}`;
  $('#fstatus').textContent = 'Opening your email app…';
};
