/**
 * charts.js
 * Chart.js rendering for PropCalc
 */

let cPass = null;
let cCost = null;

/**
 * Draw (or redraw) both charts from window.results.
 */
function drawCharts() {
  if (!window.Chart) {
    setTimeout(drawCharts, 200);
    return;
  }

  const lbl = window.results.map(d => d.risk + '%');
  const ac  = '#cdad93';
  const aca = 'rgba(205,173,147,.15)';
  const grd = 'rgba(255,255,255,0.05)';
  const tck = '#4e5a66';
  const fnt = { family: 'Poppins', size: 10, weight: '500' };

  const baseOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2028',
        titleColor: '#e8edf2',
        bodyColor: '#cdad93',
        borderColor: '#2a3340',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: tck, font: fnt },
        grid: { color: 'transparent' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: tck, font: fnt },
        grid: { color: grd, drawTicks: false },
        border: { color: 'transparent', dash: [4, 4] },
      },
    },
  };

  // ── Pass Rate line chart ──
  if (cPass) cPass.destroy();
  cPass = new Chart(document.getElementById('chartPass'), {
    type: 'line',
    data: {
      labels: lbl,
      datasets: [{
        data: window.results.map(d => +(d.pr * 100).toFixed(1)),
        borderColor: ac,
        backgroundColor: aca,
        pointBackgroundColor: ac,
        pointBorderColor: '#0a0c0e',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      }],
    },
    options: {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        y: {
          ...baseOptions.scales.y,
          min: 0,
          max: 100,
          ticks: { ...baseOptions.scales.y.ticks, callback: v => v + '%', stepSize: 25 },
        },
      },
    },
  });

  // ── Expected Cost bar chart ──
  if (cCost) cCost.destroy();
  cCost = new Chart(document.getElementById('chartCost'), {
    type: 'bar',
    data: {
      labels: lbl,
      datasets: [{
        data: window.results.map(d => d.cost),
        backgroundColor: window.results.map(d =>
          d.risk === window.selRisk ? ac : 'rgba(205,173,147,.35)'
        ),
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        y: {
          ...baseOptions.scales.y,
          ticks: { ...baseOptions.scales.y.ticks, callback: v => '$' + v },
        },
      },
    },
  });
}
