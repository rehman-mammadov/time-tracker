const KEY = "planTracker_final_clean";

let db = JSON.parse(localStorage.getItem(KEY)) || {
  plans: {},
  active: null,
  running: false,
  start: null
};

let interval = null;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function format(sec) {
  const h = String(Math.floor(sec/3600)).padStart(2,"0");
  const m = String(Math.floor((sec%3600)/60)).padStart(2,"0");
  const s = String(sec%60).padStart(2,"0");
  return `${h}:${m}:${s}`;
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function activePlan() {
  return db.plans[db.active];
}

function startTimer() {
  if (!db.active || db.running) return;
  db.running = true;
  db.start = Date.now();
  interval = setInterval(render, 500);
}

function stopTimer() {
  if (!db.running) return;
  const p = activePlan();
  const t = today();
  p[t] = (p[t] || 0) + Math.floor((Date.now() - db.start)/1000);
  db.running = false;
  db.start = null;
  clearInterval(interval);
  save();
}

function render() {
  let sec = 0;
  if (db.active) {
    const p = activePlan();
    sec = p[today()] || 0;
    if (db.running) {
      sec += Math.floor((Date.now() - db.start)/1000);
    }
  }

  document.getElementById("display").innerText = format(sec);
  document.getElementById("daily").innerText = "Bu gün: " + format(sec);
  document.getElementById("activeName").innerText = db.active ? activePlan().name : "Heç biri";

  renderPlans();
  renderHistory();
}

function renderPlans() {
  const wrap = document.getElementById("plans");
  wrap.innerHTML = "";

  for (const id in db.plans) {
    const p = db.plans[id];

    let todaySec = p[today()] || 0;
    let sec7 = 0, sec30 = 0;

    for (const d in p) {
      if (d === "name") continue;
      const diff = (new Date(today()) - new Date(d)) / 86400000;
      if (diff >= 0 && diff < 7) sec7 += p[d];
      if (diff >= 0 && diff < 30) sec30 += p[d];
    }

    const div = document.createElement("div");
    div.className = "planItem";

    const left = document.createElement("div");
    left.className = "planLeft";
    left.innerHTML = `
      <b>${p.name}${db.active === id ? " •" : ""}</b>
      <div class="planStats">
        Bu gün: ${format(todaySec)}
        &nbsp; 7 gün: ${format(sec7)}
        &nbsp; 30 gün: ${format(sec30)}
      </div>
    `;

    const btns = document.createElement("div");
    btns.className = "planBtns";

    const sel = document.createElement("button");
    sel.className = "select";
    sel.innerText = "Seç / Başla";
    sel.onclick = () => {
      if (db.running) stopTimer();
      db.active = id;
      startTimer();
      save();
      render();
    };

    const del = document.createElement("button");
    del.className = "delete";
    del.innerText = "Sil";
    del.onclick = () => {
      if (confirm("Plan silinsin?")) {
        if (db.active === id) stopTimer();
        delete db.plans[id];
        db.active = null;
        save();
        render();
      }
    };

    btns.appendChild(sel);
    btns.appendChild(del);

    div.appendChild(left);
    div.appendChild(btns);
    wrap.appendChild(div);
  }
}

function renderHistory() {
  const table = document.getElementById("history");
  table.innerHTML = `<tr><th>Tarix</th><th>Ümumi vaxt</th></tr>`;

  const total = {};
  for (const p of Object.values(db.plans)) {
    for (const d in p) {
      if (d === "name") continue;
      total[d] = (total[d] || 0) + p[d];
    }
  }

  Object.keys(total).sort().reverse().forEach(d => {
    const r = table.insertRow();
    r.insertCell(0).innerText = d.split("-").reverse().join(".");
    r.insertCell(1).innerText = format(total[d]);
  });
}

document.getElementById("addPlanBtn").onclick = () => {
  const name = prompt("Plan adı:");
  if (!name) return;
  db.plans[Date.now()] = { name };
  save();
  render();
};

document.getElementById("startBtn").onclick = startTimer;
document.getElementById("stopBtn").onclick = stopTimer;
document.getElementById("resetBtn").onclick = () => {
  if (!db.active) return;
  db.plans[db.active][today()] = 0;
  save();
  render();
};

document.getElementById("clearAll").onclick = () => {
  if (confirm("Hamısı silinsin?")) {
    localStorage.removeItem(KEY);
    location.reload();
  }
};

render();
