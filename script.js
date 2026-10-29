const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const selectedDateText = document.getElementById("selectedDate");
const eventForm = document.getElementById("eventForm");
const eventTitle = document.getElementById("eventTitle");
const eventTime = document.getElementById("eventTime");
const eventList = document.getElementById("eventList");
const eventCount = document.getElementById("eventCount");

const today = new Date();
let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = formatDate(today);
let events = loadEvents();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem("mycalendar-events")) || {};
  } catch {
    return {};
  }
}

function saveEvents() {
  localStorage.setItem("mycalendar-events", JSON.stringify(events));
}

function renderCalendar() {
  monthTitle.textContent = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  calendarGrid.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  for (let i = 0; i < 42; i++) {
    let date;

    if (i < firstDay) {
      date = new Date(year, month - 1, previousMonthDays - firstDay + i + 1);
    } else if (i >= firstDay + daysInMonth) {
      date = new Date(year, month + 1, i - firstDay - daysInMonth + 1);
    } else {
      date = new Date(year, month, i - firstDay + 1);
    }

    const key = formatDate(date);
    const isCurrentMonth = date.getMonth() === month;
    const button = document.createElement("button");

    button.type = "button";
    button.className = "day";
    button.setAttribute("aria-label", date.toLocaleDateString());

    if (!isCurrentMonth) button.classList.add("outside");
    if (key === formatDate(today)) button.classList.add("today");
    if (key === selectedDate) button.classList.add("selected");
    if (events[key]?.length) button.classList.add("has-events");

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = date.getDate();
    button.appendChild(number);

    button.addEventListener("click", () => {
      selectedDate = key;
      currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      renderCalendar();
      renderEvents();
    });

     calendarGrid.appendChild(button);
  }
}

function renderEvents() {
  const date = new Date(`${selectedDate}T12:00:00`);

  selectedDateText.textContent = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const dayEvents = events[selectedDate] || [];
  eventCount.textContent = dayEvents.length;
  eventList.innerHTML = "";

  if (dayEvents.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing planned yet. Add your first event!";
    eventList.appendChild(empty);
    return;
  }

   [...dayEvents]
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .forEach(event => {
      const item = document.createElement("li");
      item.className = "event-item";

      const details = document.createElement("div");
      const title = document.createElement("strong");
      const time = document.createElement("small");

      title.textContent = event.title;
      time.textContent = event.time || "No time set";

      details.append(title, time);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-btn";
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("aria-label", `Delete ${event.title}`);

      deleteButton.addEventListener("click", () => {
        events[selectedDate] = events[selectedDate].filter(
          savedEvent => savedEvent.id !== event.id
        );

        if (events[selectedDate].length === 0) {
          delete events[selectedDate];
        }

        saveEvents();
        renderCalendar();
        renderEvents();
      });

      item.append(details, deleteButton);
      eventList.appendChild(item);
    });
}

eventForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = eventTitle.value.trim();
  if (!title) return;

  if (!events[selectedDate]) events[selectedDate] = [];

  events[selectedDate].push({
    id: crypto.randomUUID(),
    title,
    time: eventTime.value
  });

  saveEvents();
  eventForm.reset();
  renderCalendar();
  renderEvents();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

document.getElementById("todayBtn").addEventListener("click", () => {
  currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = formatDate(new Date());
  renderCalendar();
  renderEvents();
});

renderCalendar();
renderEvents();


