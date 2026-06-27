// ── Mobile nav toggle ───────────────────────────────────
const toggle = document.getElementById('nav-toggle');
const nav    = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}
document.querySelectorAll('.nav-link').forEach(l =>
  l.addEventListener('click', () => nav && nav.classList.remove('open'))
);

// ── Header scroll border ────────────────────────────────
const header = document.getElementById('site-header');
if (header) {
  window.addEventListener('scroll', () =>
    header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
}

// ── Reading progress bar ────────────────────────────────
const bar = document.getElementById('progress-bar');
if (bar) {
  window.addEventListener('scroll', () => {
    const doc   = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
  }, { passive: true });
}

// ── Fade-in on scroll (staggered) ──────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });
  fadeEls.forEach(el => io.observe(el));
}

// ── Code blocks: window bar + language label + copy ────
document.querySelectorAll('.post-content .highlighter-rouge').forEach(outer => {
  const inner = outer.querySelector('.highlight');
  if (!inner) return;

  const match = outer.className.match(/language-(\w+)/);

  // Build window bar
  const bar = document.createElement('div');
  bar.className = 'code-window-bar';

  const dots = document.createElement('div');
  dots.className = 'code-dots';
  dots.innerHTML = '<span></span><span></span><span></span>';
  bar.appendChild(dots);

  if (match) {
    const lang = document.createElement('span');
    lang.className = 'code-lang';
    lang.textContent = match[1];
    bar.appendChild(lang);
  }

  const copyBtn = document.createElement('button');
  copyBtn.className = 'code-copy-btn';
  copyBtn.textContent = 'copy';
  copyBtn.setAttribute('aria-label', '코드 복사');
  bar.appendChild(copyBtn);

  inner.insertBefore(bar, inner.firstChild);

  copyBtn.addEventListener('click', async () => {
    const pre = inner.querySelector('pre');
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''));
      copyBtn.textContent = 'copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'copy'; copyBtn.classList.remove('copied'); }, 2000);
    } catch {
      copyBtn.textContent = 'error';
    }
  });
});

// ── Back to top button ──────────────────────────────────
const topBtn = document.createElement('button');
topBtn.id = 'back-to-top';
topBtn.setAttribute('aria-label', '맨 위로');
topBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
document.body.appendChild(topBtn);

window.addEventListener('scroll', () =>
  topBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });

topBtn.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' }));
