"use strict";

class App {
  #map;
  #workouts = [];
  #list;
  #event;
  #form;
  #menu = document.querySelector(".main-menu");

  constructor() {
    this.#event = null;
    this.#map = L.map("map");
    this.#form = new Form(".register-record");
    this.#list = document.querySelector(".workout-list");
    this.#list.addEventListener("click", e => {
      const target = e.target.closest(".workout");

      if (!target) return;

      const workout = this.#workouts.find(
        item => item.id === Number(target.dataset.id)
      );
      workout && this.#map.setView(workout.coords);
    });

    // menu setup
    this._initializeMenu();

    this.#form.on("submit", this._handleFormSubmit);

    // load local data
    this._deserialize();

    this._initializeMap();
    this._initialRender();
  }

  _initializeMenu() {
    const removeAll = this.#menu.querySelector("#remove-all");
    removeAll.addEventListener("click", () => this.clearLocalStorage());
  }

  _handleFormSubmit = e => {
    e.preventDefault();

    try {
      const { type, data } = this.#form.getParsedData();
      // TODO: later change here!
      const id = this.#workouts.length;
      let workout;

      const params = { ...data, coords: this.#event.latlng, id, type };

      if (type === "running") {
        workout = new Running(params);
      } else {
        workout = new Cycling(params);
      }

      this.#workouts.push(workout);

      // render in workout sidebar
      workout.renderCard(this.#list);
      workout.renderMapMarker(this.#map);

      // clear and close form
      this.#form.reset();
      this.#form.hide();

      // save to localstorage
      this._serialize();
    } catch (e) {
      alert(e);
      return;
    }
  };

  _initializeMap() {
    const tileMapUrl =
      "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const {
            coords: { latitude, longitude },
          } = pos;

          this.#map.setView([latitude, longitude], 13);
          L.tileLayer(tileMapUrl, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(this.#map);

          this.#map.on("click", this._handleMapClick);
        },
        () => {
          alert("Could not get your location");
        }
      );
    }
  }

  _handleMapClick = mapEvent => {
    // show register form
    this.#form.show();
    this.#event = mapEvent;
  };

  _initialRender() {
    this.#workouts?.forEach(workout => workout.renderCard(this.#list));

    this.#map.on("load", () => {
      this.#workouts?.forEach(workout => workout.renderMapMarker(this.#map));
    });
  }

  _serialize() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _deserialize() {
    const plainWorkouts = JSON.parse(localStorage.getItem("workouts"));
    const workouts = plainWorkouts?.map(obj => Workout.parse(obj));

    this.#workouts = workouts ?? [];
  }

  clearLocalStorage() {
    if (!localStorage.getItem("workouts")) return;

    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
