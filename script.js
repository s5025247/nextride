
let timetable = [];
let currentIndex = 0;
let currentRoute = "nobus_outbound";

function loadTimetable(route) {
  fetch(`train_data/${route}.json`)
    .then(res => res.json())
    .then(data => {
      timetable = data;
      const idx = findCurrentIndex();
      currentIndex = idx !== -1 ? idx : 0;
      document.getElementById("trip-summary").innerText = `出発：${timetable[currentIndex].home_depart}　到着：${timetable[currentIndex].home_arrive}`;
      render(currentIndex);
    });
}

function toggleButton(groupAttr, selectedBtn) {
  document.querySelectorAll(`.toggle-btn[data-${groupAttr}]`).forEach(btn => {
    btn.classList.remove("active");
  });
  selectedBtn.classList.add("active");
  const direction = document.querySelector(".toggle-btn[data-direction].active").dataset.direction;
  const bus = document.querySelector(".toggle-btn[data-bus].active").dataset.bus;
  currentRoute = `${bus === "on" ? "bus" : "nobus"}_${direction}`;
  loadTimetable(currentRoute);
  clearPageButtonActive();
}

function findCurrentIndex() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return timetable.findIndex(entry => {
    const first = entry.segments[0];
    return first && timeToMinutes(first.depart) > nowMinutes;
  });
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function render(index) {
  const entry = timetable[index];
  const container = document.getElementById("timetable-container");
  container.innerHTML = entry.segments.map((segment, i) => {
    let icon = "train.svg";
    if ((segment.from === "名古屋" && segment.to === "米原") || (segment.from === "米原" && segment.to === "名古屋")) {
      icon = "shinkansen.svg";
    } else if ((segment.from === "彦根" && segment.to === "大学") || (segment.from === "大学" && segment.to === "彦根")) {
      icon = "bus.svg";
    }

    function convertDuration(duration) {
      if (!duration) return "";
      const [h, m] = duration.split(":").map(Number);
      return `${h * 60 + m}分`;
    }

    let html = `<div class="timetable-entry">
      <div class="time-block">
        <div>${segment.depart}</div>
        <div>${segment.from}</div>
      </div>
      <div class="connector">
        <div class="connector-line"></div>
        <div class="connector-icon-wrapper">
          <img src="${icon}" class="connector-icon" alt="icon">
          <div class="duration-info">${convertDuration(segment.duration)}</div>
        </div>
        <div class="connector-line"></div>
      </div>
      <div class="time-block">
        <div>${segment.arrive}</div>
        <div>${segment.to}</div>
      </div>
    </div>`;

    const next = entry.segments[i + 1];
    if (next && next.transfer) {
      html += `<div class="transfer-time">乗換：${next.transfer}</div>`;
    }

    return html;
  }).join("");
}

function showPrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    document.getElementById("trip-summary").innerText = `出発：${timetable[currentIndex].home_depart}　到着：${timetable[currentIndex].home_arrive}`;
    render(currentIndex);
    clearPageButtonActive();
  }
}

function showNext() {
  if (currentIndex < timetable.length - 1) {
    currentIndex++;
    document.getElementById("trip-summary").innerText = `出発：${timetable[currentIndex].home_depart}　到着：${timetable[currentIndex].home_arrive}`;
    render(currentIndex);
    clearPageButtonActive();
  }
}

function jumpToFixedIndex(index, btn) {
  currentRoute = "nobus_outbound";
  fetch(`train_data/${currentRoute}.json`)
    .then(res => res.json())
    .then(data => {
      timetable = data;
      currentIndex = index;
      document.getElementById("trip-summary").innerText = 
        `出発：${timetable[currentIndex].home_depart}　到着：${timetable[currentIndex].home_arrive}`;
      render(currentIndex);
      clearPageButtonActive();
      btn.classList.add("active");
    });
}

function clearPageButtonActive() {
  document.querySelectorAll(".page-buttons button").forEach(btn => {
    btn.classList.remove("active");
  });
}

window.onload = () => loadTimetable(currentRoute);
