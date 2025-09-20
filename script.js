let timer;
let seconds = 0;
let isRunning = false;
let today = new Date().toLocaleDateString("az-AZ");

// localStorage-dan oxu
let dailyData = JSON.parse(localStorage.getItem("dersVaxti")) || {};
let dailySeconds = dailyData[today] || 0;

function formatTime(totalSeconds) {
  let hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  let mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  let secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateDisplay() {
  document.getElementById("display").innerText = formatTime(seconds);
}

function updateDaily() {
  document.getElementById("daily").innerText =
    `Bu gün: ${formatTime(dailySeconds)}`;
}

function start() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      seconds++;
      dailySeconds++;
      updateDisplay();
      updateDaily();
    }, 1000);
  }
}

function stop() {
  isRunning = false;
  clearInterval(timer);
  saveData();
  renderHistory();
}

function reset() {
  stop();
  seconds = 0;
  updateDisplay();
}

function saveData() {
  dailyData[today] = dailySeconds;
  localStorage.setItem("dersVaxti", JSON.stringify(dailyData));
}

function renderHistory() {
  let table = document.getElementById("history");
  table.innerHTML = `
    <tr>
      <th>Tarix</th>
      <th>Ümumi vaxt</th>
    </tr>
  `;
  let dates = Object.keys(dailyData).sort((a, b) => {
    let da = new Date(a.split(".").reverse().join("-"));
    let db = new Date(b.split(".").reverse().join("-"));
    return db - da;
  });

  let totalSeconds30 = 0;

  dates.slice(0, 30).forEach(d => {
    let row = table.insertRow();
    row.insertCell(0).innerText = d;
    row.insertCell(1).innerText = formatTime(dailyData[d]);
    totalSeconds30 += dailyData[d];
  });

  document.getElementById("total30").innerText =
    "Son 30 gün: " + formatTime(totalSeconds30);
}

function clearHistory() {
  if (confirm("Son 30 günün məlumatlarını silmək istədiyinizə əminsiniz?")) {
    dailyData = {};
    localStorage.removeItem("dersVaxti");
    dailySeconds = 0;
    seconds = 0;
    updateDisplay();
    updateDaily();
    renderHistory();
  }
}

// İlk açılış
updateDisplay();
updateDaily();
renderHistory();
