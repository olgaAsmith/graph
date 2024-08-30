const table = document.getElementById('data-table');
const accordions = document.querySelectorAll('.accordion');
const charts = [];

function formatNumber(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function unformatNumber(value) {
  return value.replace(/\s/g, '');
}

function getRowData(row) {
  let currentDay =
    parseFloat(unformatNumber(row.children[1].textContent.trim())) || 0;
  let yesterday =
    parseFloat(unformatNumber(row.children[2].textContent.trim())) || 0;
  let currentWeekDay =
    parseFloat(unformatNumber(row.children[3].textContent.trim())) || 0;
  return [yesterday, currentDay, currentWeekDay];
}

function checkValues() {
  const rows = table.querySelectorAll('tbody > tr:not(.accordion)');

  rows.forEach((row) => {
    let currentDay =
      parseFloat(unformatNumber(row.children[1].textContent.trim())) || 0;
    let yesterday =
      parseFloat(unformatNumber(row.children[2].textContent.trim())) || 0;
    let currentWeekDay =
      parseFloat(unformatNumber(row.children[3].textContent.trim())) || 0;

    row.children[2].classList.remove('td-green', 'td-red');
    row.children[2].removeAttribute('data-percentage');
    row.children[3].classList.remove('td-green-week', 'td-red-week');
    row.children[3].removeAttribute('data-percentage');

    if (yesterday > 0) {
      if (currentDay > yesterday) {
        const percentageIncrease = Math.round(
          ((currentDay - yesterday) / yesterday) * 100
        );
        row.children[2].classList.add('td-green');
        row.children[2].setAttribute(
          'data-percentage',
          `+${percentageIncrease}%`
        );
      } else if (currentDay < yesterday) {
        const percentageDecrease = Math.round(
          ((yesterday - currentDay) / yesterday) * 100
        );
        row.children[2].classList.add('td-red');
        row.children[2].setAttribute(
          'data-percentage',
          `-${percentageDecrease}%`
        );
      }
    }

    if (currentWeekDay > 0) {
      if (currentDay > currentWeekDay) {
        const percentageIncrease = Math.round(
          ((currentDay - currentWeekDay) / currentWeekDay) * 100
        );
        row.children[3].classList.add('td-green-week');
        row.children[3].setAttribute(
          'data-percentage',
          `+${percentageIncrease}%`
        );
      } else if (currentDay < currentWeekDay) {
        const percentageDecrease = Math.round(
          ((currentWeekDay - currentDay) / currentWeekDay) * 100
        );
        row.children[3].classList.add('td-red-week');
        row.children[3].setAttribute(
          'data-percentage',
          `-${percentageDecrease}%`
        );
      }
    }

    row.children[1].textContent = formatNumber(currentDay);
    row.children[2].textContent = formatNumber(yesterday);
    row.children[3].textContent = formatNumber(currentWeekDay);
  });
}

function updateCharts() {
  const rows = table.querySelectorAll('tbody > tr:not(.accordion)');

  rows.forEach((row) => {
    const rowIndex = row.dataset.row;

    if (charts[rowIndex]) {
      const data = getRowData(row);
      if (data.every((value) => isFinite(value))) {
        charts[rowIndex].data.datasets[0].data = data;
        charts[rowIndex].update();
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  checkValues();
  updateCharts();
});

table.addEventListener('input', function (event) {
  if (event.target.tagName === 'TD') {
    checkValues();
    updateCharts();
  }
});

table.addEventListener('click', function (event) {
  const target = event.target;
  const row = target.closest('tr');

  if (row && row.dataset.row) {
    if (target.cellIndex === 0) {
      const rowIndex = row.dataset.row;
      const accordionRow = document.querySelector(
        `.accordion[data-row="${rowIndex}"]`
      );
      const chartContainer = accordionRow.querySelector('.chart-container');
      const canvas = chartContainer.querySelector('canvas');

      if (accordionRow.classList.contains('accordion-block')) {
        accordionRow.classList.remove('accordion-block');
      } else {
        accordions.forEach((acc) => acc.classList.remove('accordion-block'));
        accordionRow.classList.add('accordion-block');

        if (!charts[rowIndex]) {
          const data = getRowData(row);
          if (data.every((value) => isFinite(value))) {
            charts[rowIndex] = new Chart(canvas, {
              type: 'line',
              data: {
                labels: ['Вчера', 'Сегодня', 'День недели'],
                datasets: [
                  {
                    label: 'Данные',
                    data: data,
                    borderColor: 'green',
                    backgroundColor: 'green',
                    fill: false,
                  },
                ],
              },
              options: {
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
              },
            });
          }
        } else {
          updateCharts();
        }
      }
    }
  }
});
