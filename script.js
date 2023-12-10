"use strict";

const map = L.map("map");
// "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
const tileMapUrl =
  "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

const form = document.querySelector(".register-record");
const _workouts = [];
let _event;

const typeField = form.querySelector("#workout-type");
const distanceField = form.querySelector("#workout-distance");
const durationField = form.querySelector("#workout-duration");
const elevGainField = form.querySelector("#workout-elev-gain");
const cadenceField = form.querySelector("#workout-cadence");

const _getFormData = form => {
  let type;
  const fieldIds = [
    "#workout-distance",
    "#workout-duration",
    // "#workout-cadence",
    // "#workout-elev-gain",
  ];

  if (typeField.value === "running") {
    fieldIds.push("#workout-cadence");
    type = "running";
  } else {
    fieldIds.push("#workout-elev-gain");
    type = "cycling";
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

const _changeFormType = type => {
  if (type === "running") {
    elevGainField.closest(".form-label").classList.add("hidden-field");
    cadenceField.closest(".form-label").classList.remove("hidden-field");
  } else {
    elevGainField.closest(".form-label").classList.remove("hidden-field");
    cadenceField.closest(".form-label").classList.add("hidden-field");
  }
};

typeField.addEventListener("change", e => {
  const type = e.target.value.toLowerCase();
  _changeFormType(type);
});

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
  workout.renderCard(_list);
  workout.renderMapMarker(map);

  // clear and close form
  form.reset();
  form.classList.add("hidden");
};

form.addEventListener("submit", _handleFormSubmit);

class Workout {
  #id;
  #type;
  #distance;
  #duration;
  #coords;
  #date;
  #icon;

  constructor({ id, type, distance, duration, coords }) {
    this.#id = id;
    this.#type = type;
    this.#distance = distance;
    this.#duration = duration;
    this.#date = new Date();
    this.#coords = coords;
    this.#icon = "";
  }

  get icon() {
    return this.#icon;
  }

  set icon(value) {
    this.#icon = value;
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

    return `${monthNames[this.#date.getMonth()]} ${this.#date.getDate()}`;
  }

  renderCard(parentNode) {
    parentNode.insertAdjacentHTML("afterbegin", this._getRenderedHTML());
  }

  renderMapMarker(map) {
    const marker = L.marker(this.#coords);
    const message = `${this.icon} ${
      this.type === "running" ? "Running" : "Cycling"
    } on ${this.getFormattedDate()}`;
    const popup = L.popup({
      autoClose: false,
      closeOnClick: false,
      className: `popup popup--${this.#type}`,
    }).setContent(message);

    marker.addTo(map);
    marker.bindPopup(popup).openPopup();
  }
}

class Running extends Workout {
  #cadence;

  constructor({ id, type, distance, duration, coords, cadence }) {
    super({ id, type, distance, duration, coords });
    this.#cadence = cadence;
    this.icon = "🏃‍♂️";
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
        <span class="detail-icon">${this.icon}️</span>
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

  constructor({ id, type, distance, duration, coords, elevGain }) {
    super({ id, type, distance, duration, coords });
    this.#elevGain = elevGain;
    this.icon = "🚴";
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
        <span class="detail-icon">${this.icon}</span>
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
