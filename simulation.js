/**
 * simulation.js
 * Monte Carlo simulation engine for PropCalc
 */

const RISKS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/**
 * Run a single Monte Carlo simulation for one risk level.
 * @param {number} rPct  - Risk per trade in percent (e.g. 2 = 2%)
 * @param {object} p     - Parameters object from getParams()
 * @param {number} N     - Number of simulation trials (default 4000)
 * @returns {{ pr, avg, att, c5 }}
 */
function sim(rPct, p, N = 50000) {
  const r = rPct / 100;
  let pass = 0, totalTrades = 0;

  for (let t = 0; t < N; t++) {
    // ── Phase 1 ──
    let eq = 1, pk = 1, tr = 0, ok1 = false;
    for (let i = 0; i < 600; i++) {
      eq += Math.random() < p.wr ? r * p.rr : -r;
      if (p.trail && eq > pk) pk = eq;
      tr++;
      const floor = p.trail ? pk * (1 - p.dd) : 1 - p.dd;
      if (eq <= floor) break;
      if (eq >= 1 + p.pt) { ok1 = true; break; }
    }
    if (!ok1) continue;

    // ── Phase 2 (optional) ──
    if (p.phase === 2) {
      let e2 = 1, p2 = 1, ok2 = false;
      for (let i = 0; i < 600; i++) {
        e2 += Math.random() < p.wr ? r * p.rr : -r;
        if (p.trail && e2 > p2) p2 = e2;
        tr++;
        const floor = p.trail ? p2 * (1 - p.dd) : 1 - p.dd;
        if (e2 <= floor) break;
        if (e2 >= 1 + p.pt2) { ok2 = true; break; }
      }
      if (!ok2) continue;
    }

    pass++;
    totalTrades += tr;
  }

  const pr  = pass / N;
  const avg = pass > 0 ? Math.round(totalTrades / pass) : 0;

  // Attempts needed for 90% confidence: n = ceil(log(0.1) / log(1-p))
  const att = pr > 0 && pr < 1 ? Math.ceil(Math.log(0.1) / Math.log(1 - pr)) : 1;

  // Risk of 5+ consecutive failures in `att` attempts
  const fl = 1 - pr;
  const n  = Math.max(att, 5);
  const c5 = fl > 0 ? 1 - Math.pow(1 - Math.pow(fl, 5), Math.max(n - 4, 1)) : 0;

  return { pr, avg, att, c5 };
}

/**
 * Read all form inputs and return a params object.
 * @returns {object}
 */
function getParams() {
  return {
    wr:    +document.getElementById('winRate').value / 100,
    rr:    +document.getElementById('rrRatio').value,
    fee:   +document.getElementById('challengeFee').value,
    pt:    +document.getElementById('profitTarget').value / 100,
    pt2:   window.phaseMode === 2 ? +document.getElementById('profitTarget2').value / 100 : 0,
    dd:    +document.getElementById('maxDD').value / 100,
    acc:   +document.getElementById('accountSize').value,
    ps:    +document.getElementById('profitSplit').value / 100,
    phase: window.phaseMode,
    trail: window.ddMode === 'trailing',
  };
}

/**
 * Run the full simulation across all risk levels and store results.
 */
function runSimulation() {
  const btn = document.getElementById('btnRun');
  btn.textContent = '\u27F3 Simulation en cours\u2026';
  btn.disabled = true;

  setTimeout(() => {
    const p = getParams();
    window.results = [];

    RISKS.forEach(rp => {
      const s    = sim(rp, p);
      const cost = s.att * p.fee;
      const profit = p.acc * p.ps * p.pt;
      window.results.push({
        risk: rp,
        pr:   s.pr,
        avg:  s.avg,
        att:  s.att,
        cost,
        c5:   s.c5,
        be:   profit > 0 ? cost / profit : 0,
        fee:  p.fee,
      });
    });

    btn.textContent = '\u25B6 Lancer la Simulation';
    btn.disabled = false;

    drawCharts();
    drawTable();
    updateView();
  }, 50);
}
