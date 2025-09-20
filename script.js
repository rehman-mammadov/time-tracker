let startTime;
let timer;
let isRunning = false;
let today = new Date().toLocaleDateString("az-AZ");

// localStorage oxu
let dailyData = JSON.parse(localStorage.getItem("dersVaxti")) || {};
let dailySeconds = dailyData[today] || 0;

function formatTime(totalSeconds) {
  let hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  let mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  let secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateDisplay(seconds) {
  document.getElementById("display").innerText = formatTime(seconds);
}

function updateDaily() {
  document.getElementById("daily").innerText =
    `Bu gün: ${formatTime(dailySeconds)}`;
}

function start() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - (dailySeconds * 1000); // əvvəlki vaxtı nəzərə al
    timer = setInterval(() => {
      let now = Date.now();
      dailySeconds = Math.floor((now - startTime) / 1000);
      updateDisplay(dailySeconds);
      updateDaily();
    }, 500); // hər yarım saniyədən bir yenilə
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
  dailySeconds = 0;
  updateDisplay(0);
  updateDaily();
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
  if (confirm("Bütün məlumatları silmək istədiyinizə əminsiniz?")) {
    dailyData = {};
    localStorage.removeItem("dersVaxti");
    dailySeconds = 0;
    updateDisplay(0);
    updateDaily();
    renderHistory();
  }
}

// İlk açılış
updateDisplay(dailySeconds);
updateDaily();
renderHistory();
