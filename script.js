"use strict";

const map = L.map("map");
// "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
const tileMapUrl =
  "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

const form = document.querySelector(".register-record");
const _workouts = [];
let _event;

const _getFormData = form => {
  const data = {};
  const type = form.querySelector("#workout-type").value.toLowerCase();
  const fieldIds = ["#workout-distance", "#workout-duration"];

  fieldIds.push(type === "running" ? "#workout-cadence" : "#workout-elev-gain");

  fieldIds.map(
    field =>
      (data[_toCamelCase(field.slice("#workout-".length))] =
        form.querySelector(field).value)
  );

  return { type, data };
};

const cadenceInput = form.querySelector("#workout-cadence");
const elevGainInput = form.querySelector("#workout-elev-gain");
const typeSelect = form.querySelector("#workout-type");
const _changeFormType = type => {
  if (type === "running") {
    cadenceInput.closest(".form-label").classList.remove("hidden-field");
    elevGainInput.closest(".form-label").classList.add("hidden-field");
  } else {
    cadenceInput.closest(".form-label").classList.add("hidden-field");
    elevGainInput.closest(".form-label").classList.remove("hidden-field");
  }
};

typeSelect.addEventListener("change", e => {
  _changeFormType(e.target.value);
});

const _toCamelCase = text => {
  return text
    .split("-")
    .map((word, index) =>
      index ? word[0].toUpperCase().concat(word.slice(1)) : word
    )
    .join("");
};

const _renderWorkoutCard = workout => {
  const list = document.querySelector(".workout-list");
  let html;

  if (workout.type === "running") {
    html = `<li class="workout workout--running">
      <h2 class="workout-title">
        Running on <span class="workout-date">${workout.date}</span>
      </h2>
      <div class="workout-details">
        <span class="detail-icon">🏃‍♂️</span>
        <span class="detail-value">${workout.distance}</span>
        <span class="detail-unit">km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⏱</span>
        <span class="detail-value">${workout.duration}</span>
        <span class="detail-unit">min</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⚡️</span>
        <span class="detail-value">${workout.speed}</span>
        <span class="detail-unit">min/km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">🦶🏼</span>
        <span class="detail-value">${workout.cadence}</span>
        <span class="detail-unit">spm</span>
      </div>
    </li>`;
  } else {
    html = `
    <li class="workout workout--cycling">
      <h2 class="workout-title">
        Cycling on <span class="workout-date">${workout.date}</span>
      </h2>
      <div class="workout-details">
        <span class="detail-icon">🚴‍♀️</span>
        <span class="detail-value">${workout.distance}</span>
        <span class="detail-unit">km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⏱</span>
        <span class="detail-value">${workout.duration}</span>
        <span class="detail-unit">min</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⚡️</span>
        <span class="detail-value">${workout.speed}</span>
        <span class="detail-unit">km/h</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⛰</span>
        <span class="detail-value">${workout.elevGain}</span>
        <span class="detail-unit">m</span>
      </div>
    </li>`;
  }

  list.insertAdjacentHTML("afterbegin", html);
};
const handleMapClick = function (mapEvent) {
  // show register form
  form.classList.remove("hidden");
  const distanceField = form.querySelector("#workout-distance");
  distanceField.focus();

  _event = mapEvent;
};

navigator.geolocation.getCurrentPosition(pos => {
  const {
    coords: { latitude, longitude },
  } = pos;

  map.setView([latitude, longitude], 13);
  L.tileLayer(tileMapUrl, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on("click", handleMapClick);
});

const _checkValid = (...values) => true;
const _checkPositive = (...values) => values.every(value => value > 0);

const _renderMarker = workout => {
  const popupMessage = `${
    workout.type === "running" ? "🏃 Running" : "🚴‍♀️ Cycling"
  } on ${workout.date}`;
  const marker = L.marker(_event.latlng);
  const popup = L.popup({
    autoClose: false,
    closeOnClick: false,
    className: `popup popup--${workout.type}`,
  }).setContent(popupMessage);

  marker.addTo(map);
  marker.bindPopup(popup).openPopup();
};

const _handleFormSubmit = function (e) {
  e.preventDefault();
  // check values! later!!
  const { type, data } = _getFormData(form);

  if (
    !_checkValid(...Object.values(data)) ||
    !_checkPositive(...Object.values(data))
  ) {
    alert("input must be positive numbers");
    return;
  }

  const workout = { type };
  let fields;
  workout["coords"] = _event.latlng;

  // workout data
  if (type === "running") {
    fields = ["distance", "duration", "cadence"];
  } else {
    fields = ["distance", "duration", "elevGain"];
  }
  fields.forEach(field => (workout[field] = Number(data[field])));

  // later use class inherit
  workout.speed =
    type === "running"
      ? (workout.duration / workout.distance).toFixed(1)
      : ((workout.distance * 60) / workout.duration).toFixed(1);

  const monthNames = [
    "January",
    "Feburay",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date();
  workout.date = `${monthNames[date.getMonth()]} ${date.getDay()}`;

  console.log(workout);

  // add to global array of workouts
  _workouts.push(workout);

  // clear input form and hide
  form.reset();
  form.classList.add("hidden");

  // render marker
  _renderMarker(workout);
  // add to list
  _renderWorkoutCard(workout);
};

form.addEventListener("submit", _handleFormSubmit);
