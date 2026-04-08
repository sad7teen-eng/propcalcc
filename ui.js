/**
 * ui.js
 * DOM interactions, state management and view updates for PropCalc
 */

// ── Global state ──────────────────────────────────────────────────────────────
window.results  = [];
window.selRisk  = 2;
window.phaseMode = 1;
window.ddMode   = 'initial';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, d = 0) {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

// ── Segmented controls ────────────────────────────────────────────────────────
document.querySelectorAll('.seg button[data-phase]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.seg button[data-phase]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    window.phaseMode = +b.dataset.phase;
    document.getElementById('phase2Row').style.display =
      window.phaseMode === 2 ? 'grid' : 'none';
  });
});

document.querySelectorAll('.seg button[data-dd]').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.seg button[data-dd]').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    window.ddMode = b.dataset.dd;
  });
});

document.getElementById('btnRun').addEventListener('click', runSimulation);

// ── Risk pills ────────────────────────────────────────────────────────────────
function buildPills() {
  const wrap = document.getElementById('riskPills');
  wrap.innerHTML = '';
  RISKS.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'pill' + (r === window.selRisk ? ' on' : '');
    btn.textContent = r + '%';
    btn.onclick = () => {
      window.selRisk = r;
      buildPills();
      updateView();
    };
    wrap.appendChild(btn);
  });
}

// ── Stats view ────────────────────────────────────────────────────────────────
function updateView() {
  const d = window.results.find(x => x.risk === window.selRisk);
  if (!d) return;

  document.getElementById('statPassRate').textContent    = fmt(d.pr * 100, 1) + '%';
  document.getElementById('statAvgTrades').textContent   = d.avg || '\u2014';
  document.getElementById('statAttempts').textContent    = d.att;
  document.getElementById('statAttemptsNote').textContent = 'Pour 90% de chance de validation';
  document.getElementById('statCost').textContent        = fmt(d.cost) + ' $';
  document.getElementById('statCostNote').textContent    = '\u00C0 ' + fmt(d.fee) + ' $ / tentative';
  document.getElementById('statConsecFail').textContent  = fmt(d.c5 * 100, 1) + '%';
  document.getElementById('statBreakeven').textContent   = fmt(d.be * 100, 2) + '%';

  // Color-code pass rate
  const el = document.getElementById('statPassRate');
  el.className = 'scard-val ' + (d.pr >= 0.7 ? 'a' : d.pr >= 0.5 ? 'y' : 'r');

  // Highlight table row
  document.querySelectorAll('#tableBody tr').forEach(tr => {
    tr.classList.toggle('hl', +tr.dataset.r === window.selRisk);
  });
}

// ── Table ─────────────────────────────────────────────────────────────────────
function drawTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  window.results.forEach(d => {
    const tr = document.createElement('tr');
    tr.dataset.r = d.risk;
    tr.onclick = () => {
      window.selRisk = d.risk;
      buildPills();
      updateView();
    };

    const pc = d.pr >= 0.7 ? 'g' : d.pr >= 0.5 ? 'w' : 'b';
    const cc = d.c5 < 0.01 ? 'g' : d.c5 < 0.05 ? 'w' : 'b';

    tr.innerHTML = `
      <td>${d.risk === window.selRisk ? '<span class="pdot"></span>' : ''}${d.risk}%</td>
      <td class="${pc}">${fmt(d.pr * 100, 1)}%</td>
      <td>${d.avg}</td>
      <td>${d.att}</td>
      <td>${fmt(d.cost)} $</td>
      <td class="${cc}">${fmt(d.c5 * 100, 1)}%</td>
      <td>${fmt(d.be * 100, 2)}%</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  buildPills();
  setTimeout(runSimulation, 350);
});
