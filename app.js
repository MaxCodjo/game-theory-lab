/* ===== The Game Theory Lab — interactions ===== */

// ---------- scroll progress + nav ----------
const progressBar = document.getElementById('progressBar');
const nav = document.getElementById('nav');
const toc = document.getElementById('toc');
addEventListener('scroll', () => {
  const h = document.documentElement;
  progressBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  nav.classList.toggle('scrolled', h.scrollTop > 40);
  toc.classList.toggle('visible', h.scrollTop > innerHeight * 0.6);
}, { passive: true });

document.getElementById('navBurger').addEventListener('click', () =>
  document.querySelector('.nav-links').classList.toggle('open'));

// active TOC link
const tocLinks = [...document.querySelectorAll('[data-toc]')];
const tocObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-30% 0px -60% 0px' });
tocLinks.forEach(a => {
  const t = document.querySelector(a.getAttribute('href'));
  if (t) tocObs.observe(t);
});

// ---------- reveal on scroll ----------
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ---------- animated counters ----------
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    statObs.unobserve(e.target);
    const end = +e.target.dataset.count, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1200, 1);
      e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
});
document.querySelectorAll('.stat').forEach(el => statObs.observe(el));

// ---------- hero canvas: strategic network ----------
(() => {
  const cv = document.getElementById('heroCanvas'), ctx = cv.getContext('2d');
  let W, H, nodes;
  const resize = () => {
    W = cv.width = cv.offsetWidth * devicePixelRatio;
    H = cv.height = cv.offsetHeight * devicePixelRatio;
    nodes = Array.from({ length: Math.min(70, W / 22) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35 * devicePixelRatio, vy: (Math.random() - .5) * .35 * devicePixelRatio
    }));
  };
  resize(); addEventListener('resize', resize);
  const step = () => {
    ctx.clearRect(0, 0, W, H);
    const R = 130 * devicePixelRatio;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < R) {
        ctx.strokeStyle = `rgba(79,209,255,${(1 - d / R) * .25})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(139,209,255,.7)';
    for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, 7); ctx.fill(); }
    requestAnimationFrame(step);
  };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) step();
})();

// ---------- model card tabs ----------
document.querySelectorAll('[data-tabs]').forEach(tabs => {
  const scope = tabs.parentElement;
  tabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab'); if (!btn) return;
    tabs.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
    scope.querySelectorAll('.pane').forEach(p =>
      p.classList.toggle('active', p.dataset.pane === btn.dataset.tab));
  });
});

// ---------- Lab 1: iterated prisoner's dilemma vs tit-for-tat ----------
(() => {
  let you = 0, bot = 0, round = 0, botMove = 'C', lastYou = null;
  const $ = id => document.getElementById(id);
  const PAY = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] };
  const play = my => {
    const key = my + botMove, [a, b] = PAY[key];
    you += a; bot += b; round++;
    const cell = document.createElement('span');
    cell.className = 'h-cell ' + (key === 'CC' ? 'h-cc' : key === 'DD' ? 'h-dd' : 'h-mix');
    cell.textContent = my === 'C' ? '🤝' : '🗡';
    cell.title = `Round ${round}: you ${my}, bot ${botMove} → +${a}/+${b}`;
    $('pdHistory').appendChild(cell);
    $('pdYou').textContent = you; $('pdBot').textContent = bot; $('pdRound').textContent = round;
    botMove = my;            // tit-for-tat copies you
    lastYou = my;
    $('pdLesson').textContent =
      round < 3 ? 'Payoffs — both cooperate: 3/3 · both defect: 1/1 · lone defector: 5, sucker: 0.'
      : you > bot ? 'You\'re ahead — but check: is the pie growing, or are you just splitting a smaller one?'
      : you === bot ? 'Tied. Against Tit-for-Tat you can never finish ahead by more than one betrayal — mutual cooperation maximizes the total.'
      : 'Tit-for-Tat is winning. Notice: it never defects first, always retaliates, always forgives. That\'s why it won Axelrod\'s tournament.';
  };
  $('pdCoop').onclick = () => play('C');
  $('pdDefect').onclick = () => play('D');
  $('pdReset').onclick = () => {
    you = bot = round = 0; botMove = 'C'; $('pdHistory').innerHTML = '';
    ['pdYou', 'pdBot', 'pdRound'].forEach(i => $(i).textContent = '0');
    $('pdLesson').textContent = 'Payoffs — both cooperate: 3/3 · both defect: 1/1 · lone defector: 5, sucker: 0.';
  };
})();

// ---------- Lab 2: penalty kick vs adaptive goalie ----------
(() => {
  const $ = id => document.getElementById(id);
  const POS = ['14%', '50%', '86%'];
  let counts = [0, 0, 0], goals = 0, saves = 0;
  document.querySelectorAll('[data-kick]').forEach(btn => btn.addEventListener('click', () => {
    const kick = +btn.dataset.kick;
    counts[kick]++;
    const total = counts.reduce((a, b) => a + b, 0);
    // goalie dives proportionally to your revealed frequencies (with a floor of uniform)
    const w = counts.map(c => c + 1);
    const wSum = w[0] + w[1] + w[2];
    let r = Math.random() * wSum, dive = 0;
    for (let i = 0; i < 3; i++) { r -= w[i]; if (r <= 0) { dive = i; break; } }
    const goal = dive !== kick || Math.random() < 0.18; // small chance keeper guesses right but misses
    $('pkBall').style.left = POS[kick];
    $('pkBall').style.bottom = '55%';
    $('pkKeeper').style.left = POS[dive];
    const goalBox = document.querySelector('.goal');
    goalBox.classList.remove('flash-goal', 'flash-save');
    void goalBox.offsetWidth;
    goalBox.classList.add(goal ? 'flash-goal' : 'flash-save');
    if (goal) goals++; else saves++;
    $('pkGoals').textContent = goals; $('pkSaves').textContent = saves;
    $('pkMix').textContent = counts.map(c => Math.round(c / total * 100) + '%').join(' / ');
    const maxShare = Math.max(...counts) / total;
    $('pkLesson').textContent =
      total < 5 ? 'The goalie is watching your pattern…'
      : maxShare > 0.55 ? `⚠ You kick one way ${Math.round(maxShare * 100)}% of the time — the goalie has noticed. Mix it up!`
      : '✓ Nicely mixed — near-equilibrium randomness is exactly what pros do.';
    setTimeout(() => { $('pkBall').style.left = '50%'; $('pkBall').style.bottom = '6px'; }, 600);
  }));
  $('pkReset').onclick = () => {
    counts = [0, 0, 0]; goals = saves = 0;
    $('pkGoals').textContent = '0'; $('pkSaves').textContent = '0'; $('pkMix').textContent = '–';
    $('pkLesson').textContent = 'Optimal play ≈ randomize close to your best equilibrium frequencies. Patterns get punished.';
  };
})();

// ---------- Lab 3: Nash pricing slider ----------
(() => {
  const $ = id => document.getElementById(id);
  const slider = $('nashPrice');
  // linear demand duopoly: BR(p) = (c + a + b·p)/2 with a=2, b=.5, c=1  → BR(p)=1.5+0.25p ; eq at p*≈2 → scaled up
  const BR = p => Math.min(9, Math.max(1, 2 + 0.4 * p));         // rival's best response
  const profit = (p, q) => Math.max(0, (p - 1) * Math.max(0, 10 - 1.6 * p + 0.8 * q));
  const EQ = 2 / (1 - 0.4) * 1;                                   // fixed point of BR: p = 2 + .4p → p* = 3.33
  const update = () => {
    const p = +slider.value, q = BR(p);
    $('nashPriceLabel').textContent = '$' + p.toFixed(2);
    $('nashRival').textContent = '$' + q.toFixed(2);
    $('nashProfitYou').textContent = '$' + profit(p, q).toFixed(1);
    $('nashProfitRival').textContent = '$' + profit(q, p).toFixed(1);
    const dist = Math.abs(p - EQ);
    $('nashHint').textContent =
      dist < 0.15 ? '🎯 Equilibrium! Your price ≈ the rival\'s best response to it. Neither of you gains by moving — this is Nash.'
      : dist < 0.7 ? 'Getting warm… nudge toward where your price equals the rival\'s response.'
      : p > EQ ? 'Your price is high — the rival undercuts you and takes your customers.'
      : 'You\'re underpricing — you could raise price without losing the war.';
  };
  slider.addEventListener('input', update);
  update();
})();

// ---------- flashcards (all 20 models) ----------
const MODELS = [
  ['Nash Equilibrium', '⚖️', 'stable balance', 'No player gains by deviating alone.', 'uᵢ(sᵢ*,s₋ᵢ*) ≥ uᵢ(sᵢ,s₋ᵢ*)'],
  ["Prisoner's Dilemma", '🥷', 'temptation to defect', 'Defection dominates, yet mutual cooperation beats mutual defection.', 'T > R > P > S'],
  ['Repeated Games', '🔁', 'future disciplines present', 'Discounted payoffs sustain cooperation over time.', 'Uᵢ = (1−δ) Σ δᵗ gᵢ(aᵗ)'],
  ['Zero-Sum Games', '🎯', 'one wins, one loses', "One player's gain is exactly the other's loss.", 'u₁ + u₂ = 0'],
  ['Simultaneous Games', '🎭', 'decide without seeing', 'Everyone commits at once; normal-form matrix.', 'G = (N, {Sᵢ}, {uᵢ})'],
  ['Sequential Games', '🌳', 'order matters', 'Game tree + backward induction from the leaves.', 'G = (N, H, P, A(h), uᵢ)'],
  ['Mixed Strategies', '🎲', 'randomness is strategic', 'Randomize so the opponent is indifferent.', 'σᵢ ∈ Δ(Sᵢ)'],
  ['Cooperative Games', '🤝', 'join forces, share', 'Coalitions get values; the core keeps everyone in.', 'v : 2ᴺ → ℝ'],
  ['Bargaining Models', '🏠', 'patience is leverage', 'Maximize the product of gains over walk-away points.', 'max (u₁−d₁)(u₂−d₂)'],
  ['Stackelberg', '👑', 'leader moves first', 'Leader optimizes anticipating the follower\'s reaction.', 'qL* = argmax πL(qL, qF*(qL))'],
  ['Cournot', '🏭', 'compete on quantity', 'Firms pick output; price falls with total supply.', 'πᵢ = qᵢP(Q) − cᵢ(qᵢ)'],
  ['Bertrand', '🏷️', 'compete on price', 'Lowest price takes the market — profits race to cost.', 'πᵢ = (pᵢ−cᵢ)Dᵢ(p)'],
  ['Auctions', '🔨', 'bid under uncertainty', 'Optimal bids depend on format and information.', 'bᵢ* = argmax E[uᵢ(bᵢ, b₋ᵢ)]'],
  ['Signaling Games', '📡', 'actions reveal type', 'Informed sender signals; receiver updates by Bayes.', 'μ(s|m) = P(m|s)P(s) / ΣP(m|s′)P(s′)'],
  ['Screening Games', '🔍', 'menus reveal type', 'Principal designs contracts so types self-select.', 'max E[Uₚ] s.t. IC + IR'],
  ['Evolutionary GT', '🧬', 'fitness drives strategy', 'Strategy shares grow if they beat the average.', 'ẋᵢ = xᵢ((Ax)ᵢ − xᵀAx)'],
  ['Bayesian Games', '🃏', 'private information', 'Best-respond in expectation over others\' types.', 'θᵢ ~ p(θᵢ)'],
  ['Imperfect Information', '🌫️', 'you can\'t see it all', 'Strategies map information sets, not exact histories.', 'strategy : 𝓘 → actions'],
  ['Coordination Games', '📱', 'match to win', 'Multiple equilibria — conventions and focal points decide.', '(a,a) and (b,b) both stable'],
  ['Public Goods Games', '🌍', 'free-rider tension', 'Everyone benefits from the pot; each is tempted to skimp.', 'uᵢ = B(Σcⱼ) − cᵢ'],
];
document.getElementById('cardGrid').innerHTML = MODELS.map(([name, emoji, hook, intuition, eq], i) => `
  <div class="card reveal" tabindex="0" role="button" aria-label="Flashcard: ${name}">
    <div class="card-inner">
      <div class="card-face card-front">
        <span class="c-num">CARD ${String(i + 1).padStart(2, '0')}</span>
        <span class="c-emoji">${emoji}</span>
        <h4>${name}</h4><small>${hook}</small>
      </div>
      <div class="card-face card-back">
        <p>${intuition}</p><code>${eq}</code>
      </div>
    </div>
  </div>`).join('');
document.getElementById('cardGrid').addEventListener('click', e => {
  const card = e.target.closest('.card'); if (card) card.classList.toggle('flipped');
});
document.getElementById('cardGrid').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { const c = e.target.closest('.card'); if (c) { e.preventDefault(); c.classList.toggle('flipped'); } }
});
// re-observe cards for reveal
document.querySelectorAll('#cardGrid .reveal').forEach(el => revealObs.observe(el));

// ---------- pop quiz ----------
const QUIZ = [
  { q: 'Two firms will trade with each other every month for years. Which model explains why they behave honestly?',
    opts: ['Zero-sum games', 'Repeated games', 'Stackelberg competition'], a: 1 },
  { q: 'In a Nash equilibrium…', opts: ['every player earns the same payoff', 'no player can gain by changing strategy alone', 'players always cooperate'], a: 1 },
  { q: 'A penalty kicker should…', opts: ['always shoot to their strong side', 'randomize so the goalie is indifferent', 'watch the goalie and react'], a: 1 },
  { q: 'In the Prisoner\'s Dilemma, the Nash equilibrium is…', opts: ['both cooperate', 'both defect', 'one cooperates, one defects'], a: 1 },
  { q: 'A big chain announces prices first; small stores respond. That\'s…', opts: ['Stackelberg competition', 'a coordination game', 'a public goods game'], a: 0 },
];
(() => {
  const body = document.getElementById('quizBody');
  let idx = 0, score = 0;
  const render = () => {
    if (idx >= QUIZ.length) {
      body.innerHTML = `<p class="q-meta">Quiz complete</p><p class="q-score">${score} / ${QUIZ.length}</p>
        <p>${score === 5 ? '🏆 Perfect — you think in equilibria.' : score >= 3 ? '👍 Solid. Re-read the models you missed.' : '📚 Scroll back up — the models are waiting.'}</p>
        <button class="btn btn-ghost btn-sm" id="quizAgain">↺ Try again</button>`;
      document.getElementById('quizAgain').onclick = () => { idx = 0; score = 0; render(); };
      return;
    }
    const { q, opts } = QUIZ[idx];
    body.innerHTML = `<p class="q-meta">Question ${idx + 1} of ${QUIZ.length}</p><p class="q-question">${q}</p>` +
      opts.map((o, i) => `<button class="q-opt" data-i="${i}">${o}</button>`).join('');
    body.querySelectorAll('.q-opt').forEach(btn => btn.onclick = () => {
      const i = +btn.dataset.i, correct = QUIZ[idx].a;
      body.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
      btn.classList.add(i === correct ? 'correct' : 'wrong');
      if (i !== correct) body.querySelector(`[data-i="${correct}"]`).classList.add('correct');
      else score++;
      setTimeout(() => { idx++; render(); }, 900);
    });
  };
  render();
})();

// ---------- KaTeX ----------
document.addEventListener('DOMContentLoaded', () => {
  if (window.renderMathInElement) renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\(', right: '\\)', display: false },
    ],
  });
});
