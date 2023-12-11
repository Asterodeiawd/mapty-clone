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

const _list = document.querySelector(".workout-list");

const frm = new Form(form);

const _toCamelCase = text =>
  text
    .split("-")
    .map((word, index) =>
      index ? word[0].toUpperCase().concat(word.slice(1)) : word
    )
    .join("");

_list.addEventListener("click", function (e) {
  const target = e.target.closest(".workout");

  if (!target) return;

  const workout = _workouts.find(item => item.id === Number(target.dataset.id));
  workout && map.setView(workout.coords);
});

const handleMapClick = function (mapEvent) {
  // show register form
  frm.show();
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

typeField.addEventListener("change", e => {
  const type = e.target.value.toLowerCase();
  // _changeFormType(type);
  frm._changeFormType(type);
});

const _handleFormSubmit = function (e) {
  e.preventDefault();

  try {
    const { type, data } = frm.getParsedData();
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
    frm._clear();
    frm.hide();
  } catch (e) {
    alert(e);
    return;
  }
};

form.addEventListener("submit", _handleFormSubmit);
