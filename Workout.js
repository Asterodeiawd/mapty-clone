"use strict";

class Workout {
  #id;
  #type;
  #distance;
  #duration;
  #coords;
  #date;
  #icon;

  constructor({ id, type, distance, duration, coords, date }) {
    this.#id = id;
    this.#type = type;
    this.#distance = distance;
    this.#duration = duration;
    this.#date = date ? new Date(date) : new Date();
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

  static parse(plainObject) {
    if (plainObject.type === "running") return new Running(plainObject);
    else if (plainObject.type === "cycling") return new Cycling(plainObject);
  }
}

class Running extends Workout {
  #cadence;

  constructor({ id, type, distance, duration, coords, cadence, date = null }) {
    super({ id, type, distance, duration, coords, date });
    this.#cadence = cadence;
    this.icon = "🏃‍♂️";
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      date: this.date,
      coords: this.coords,
      distance: this.distance,
      duration: this.duration,
      cadence: this.cadence,
    };
  }

  get cadence() {
    return this.#cadence;
  }

  _getRenderedHTML() {
    const html = `<li class="workout workout--running" data-id=${this.id}>
      <h2 class="workout-title">
        Running on <span class="workout-date">${this.getFormattedDate()}</span>
      </h2>
      <div class="operations">
        <button class="workout-operation edit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="operation-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button class="workout-operation remove">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="operation-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
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

  constructor({ id, type, distance, duration, coords, elevGain, date = null }) {
    super({ id, type, distance, duration, coords, date });
    this.#elevGain = elevGain;
    this.icon = "🚴";
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      date: this.date,
      coords: this.coords,
      distance: this.distance,
      duration: this.duration,
      elevGain: this.elevGain,
    };
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
      <div class="operations">
        <button class="workout-operation edit">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="operation-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button class="workout-operation remove">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="operation-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
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
