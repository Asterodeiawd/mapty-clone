"use strict";

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
        <span class="detail-value">${this.speed.toFixed(1)}</span>
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
        <span class="detail-value">${this.speed.toFixed(1)}</span>
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
