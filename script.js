"use strict";

const map = L.map("map");
// "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
const tileMapUrl =
  "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

const form = document.querySelector(".register-record");
const _workouts = [];
let _event;

const distanceField = form.querySelector("#workout-distance");

const _getFormData = form => {
  const fieldIds = [
    "#workout-distance",
    "#workout-duration",
    // "#workout-cadence",
    // "#workout-elev-gain",
  ];

  const type = form.querySelector("#workout-type").value;

  if (type === "running") {
    fieldIds.push("#workout-cadence");
  } else {
    fieldIds.push("#workout-elev-gain");
  }
  const data = {};
  fieldIds.forEach(
    field =>
      (data[_toCamelCase(field.slice("#workout-".length))] = Number(
        form.querySelector(field).value
      ))
  );

  return { type, data };
};

const _toCamelCase = text =>
  text
    .split("-")
    .map((word, index) =>
      index ? word[0].toUpperCase().concat(word.slice(1)) : word
    )
    .join("");

const handleMapClick = function (mapEvent) {
  // show register form
  form.classList.remove("hidden");
  distanceField.focus();

  // const marker = L.marker(mapEvent.latlng);
  // const popup = L.popup({
  //   autoClose: false,
  //   closeOnClick: false,
  //   className: "popup popup--running",
  // }).setContent("🚴 his is added by script");

  // marker.addTo(this);
  // marker.bindPopup(popup).openPopup();
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
const _checkPositive = (...values) => true;
const _list = document.querySelector(".workout-list");

const _handleFormSubmit = function (e) {
  e.preventDefault();
  // check values! later!!
  const { type, data } = _getFormData(form);
  // TODO: later change here!
  const id = _workouts.length;
  let workout;

  if (!_checkValid(data) || !_checkPositive(data)) {
    alert("input must be positive numbers");
    return;
  }

  const params = { ...data, coords: _event.latlng, id, type };

  if (type === "running") {
    workout = new Running(params);
  } else {
    workout = new Cycling(params);
  }

  _workouts.push(workout);

  // render in workout sidebar
  workout.render(_list);
};

form.addEventListener("submit", _handleFormSubmit);

class Workout {
  #id;
  #type;
  #distance;
  #duration;
  #coords;
  #date;

  constructor({ id, type, distance, duration, coords }) {
    this.#id = id;
    this.#type = type;
    this.#distance = distance;
    this.#duration = duration;
    this.#date = new Date();
    this.#coords = coords;
  }

  get distance() {
    return this.#distance;
  }

  get duration() {
    return this.#duration;
  }
  get speed() {
    return this.#distance / this.#duration;
  }

  get coords() {
    return this.#coords;
  }

  get date() {
    return this.#date;
  }

  get type() {
    return this.#type;
  }

  get id() {
    return this.#id;
  }

  getFormattedDate() {
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

    return `${monthNames[this.#date.getMonth()]} ${this.#date.getDay()}`;
  }

  render(parentNode) {
    parentNode.insertAdjacentHTML("afterbegin", this._getRenderedHTML());
  }
}

class Running extends Workout {
  #cadence;

  constructor({ id, type, distance, duration, coords, cadence }) {
    super({ id, type, distance, duration, coords });
    this.#cadence = cadence;
  }

  get cadence() {
    return this.#cadence;
  }

  _getRenderedHTML() {
    const html = `<li class="workout workout--running" data-id=${this.id}>
      <h2 class="workout-title">
        Running on <span class="workout-date">${this.getFormattedDate()}</span>
      </h2>
      <div class="workout-details">
        <span class="detail-icon">🏃‍♂️</span>
        <span class="detail-value">${this.distance}</span>
        <span class="detail-unit">km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⏱</span>
        <span class="detail-value">${this.duration}</span>
        <span class="detail-unit">min</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⚡️</span>
        <span class="detail-value">${this.speed}</span>
        <span class="detail-unit">min/km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">🦶🏼</span>
        <span class="detail-value">${this.cadence}</span>
        <span class="detail-unit">spm</span>
      </div>
    </li>`;

    return html;
  }
}

class Cycling extends Workout {
  #elevGain;

  constructor(id, type, distance, duration, coords, elevGain) {
    super(id, type, distance, duration, coords);
    this.#elevGain = elevGain;
  }

  get speed() {
    return (this.distance * 60) / this.duration;
  }

  get elevGain() {
    return this.#elevGain;
  }

  _getRenderedHTML() {
    const html = `<li class="workout workout--cycling" data-id=${this.id}>
      <h2 class="workout-title">
        Cycling on <span class="workout-date">${this.getFormattedDate()}</span>
      </h2>
      <div class="workout-details">
        <span class="detail-icon">🚴‍♀️</span>
        <span class="detail-value">${this.distance}</span>
        <span class="detail-unit">km</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⏱</span>
        <span class="detail-value">${this.duration}</span>
        <span class="detail-unit">min</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⚡️</span>
        <span class="detail-value">${this.speed}</span>
        <span class="detail-unit">km/h</span>
      </div>
      <div class="workout-details">
        <span class="detail-icon">⛰</span>
        <span class="detail-value">${this.elevGain}</span>
        <span class="detail-unit">m</span>
      </div>
    </li>`;

    return html;
  }
}
