"use strict";

const map = L.map("map");
// "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
const tileMapUrl =
  "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

const _workouts = [];
let _event;

const _list = document.querySelector(".workout-list");

const form = new Form(".register-record");

_list.addEventListener("click", function (e) {
  const target = e.target.closest(".workout");

  if (!target) return;

  const workout = _workouts.find(item => item.id === Number(target.dataset.id));
  workout && map.setView(workout.coords);
});

const handleMapClick = function (mapEvent) {
  // show register form
  form.show();

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

const _handleFormSubmit = function (e) {
  e.preventDefault();

  try {
    const { type, data } = form.getParsedData();
    // TODO: later change here!
    const id = _workouts.length;
    let workout;

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
    form.hide();
  } catch (e) {
    alert(e);
    return;
  }
};

form.on("submit", _handleFormSubmit);
