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

_list.addEventListener("click", function (e) {
  const target = e.target.closest(".workout");

  if (!target) return;

  const workout = _workouts.find(item => item.id === Number(target.dataset.id));
  workout && map.setView(workout.coords);
});

const _openForm = () => {
  const type = typeSelect.value;
  _changeFormType(type);
  form.classList.remove("hidden");
};

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
