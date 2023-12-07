"use strict";

const map = L.map("map");
// "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
const tileMapUrl =
  "https://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}";

const form = document.querySelector(".register-record");
const _workouts = [];
let _clickCoord;

const _getFormData = form => {
  const fieldIds = [
    "#workout-type",
    "#workout-distance",
    "#workout-duration",
    "#workout-cadence",
    "#workout-elev-gain",
  ];

  const formData = fieldIds.map(field => ({
    [_toCamelCase(field.slice("#workout-".length))]: Number(
      form.querySelector(field).value
    ),
  }));

  console.log(formData);
  return formData;
};

const _toCamelCase = text => {
  text
    .map((word, index) =>
      index ? word[0].toUpperCase().concat(word.slice(1)) : word
    )
    .join("");
};

const handleMapClick = function (mapEvent) {
  // show register form
  form.classList.remove("hidden");
  const distanceField = form.querySelector("#workout-distance");
  distanceField.focus();

  // const marker = L.marker(mapEvent.latlng);
  // const popup = L.popup({
  //   autoClose: false,
  //   closeOnClick: false,
  //   className: "popup popup--running",
  // }).setContent("🚴 his is added by script");

  // marker.addTo(this);
  // marker.bindPopup(popup).openPopup();

  _clickCoord = mapEvent.latlng;
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

const _handleFormSubmit = function (e) {
  // check values! later!!
  const data = _getFormData(form);
  console.log(data);

  if (!_checkValid(data) || !_checkPositive(data)) {
    alert("input must be positive numbers");
    return;
  }

  e.preventDefault();

  let workout = {};
  workout["coords"] = _clickCoord;

  // workout data
  if (data["type"] === "running") {
    const fields = ["distance", "duration", "cadence"];
    fields.map(field => (workout[field] = data["field"]));
  } else {
    const fields = ["distance", "duration", "elevGain"];
  }
};

form.addEventListener("submit", _handleFormSubmit);
