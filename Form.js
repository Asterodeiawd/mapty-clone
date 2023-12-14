class Form {
  #parent;
  #typeField;
  #dataFields = {};
  #editFields = {};
  mode;

  constructor(parentSelector) {
    const dataFieldIds = {
      distance: "#workout-distance",
      duration: "#workout-duration",
      cadence: "#workout-cadence",
      elevGain: "#workout-elev-gain",
    };

    const editFieldIds = {
      lat: "#workout-latitude",
      lng: "#workout-longitude",
      date: "#workout-date",
    };

    this.#parent = document.querySelector(parentSelector);
    this.#typeField = this.#parent.querySelector("#workout-type");

    Object.entries(dataFieldIds).forEach(([key, value]) => {
      this.#dataFields[key] = this.#parent.querySelector(value);
    });

    Object.entries(editFieldIds).forEach(([key, value]) => {
      this.#editFields[key] = this.#parent.querySelector(value);
    });

    this.#typeField.addEventListener("change", e => {
      this._changeFormType(e.target.value);
      // this._clear();
    });
  }

  get type() {
    return this.#typeField.value.toLowerCase();
  }

  _rawData() {
    const data = {};
    const edit = {};
    Object.entries(this.#dataFields).forEach(([key, field]) => {
      data[key] = field.value;
    });

    Object.entries(this.#editFields).forEach(([key, field]) => {
      edit[key] = field.value;
    });

    return { type: this.type, data, edit };
  }

  static _checkPositive(data) {
    return Object.values(data).every(value => value > 0);
  }

  static _checkValid(data) {
    return Object.values(data).every(value => {
      return value.trim() !== "" && !isNaN(Number(value));
    });
  }

  getParsedData() {
    const { type, data: rawData, edit: rawEdit } = this._rawData();
    delete rawData[type === "running" ? "elevGain" : "cadence"];

    const dataValues = Object.values(rawData);

    if (!Form._checkValid(dataValues) || !Form._checkPositive(dataValues))
      throw Error("values must be positive numbers");

    const data = {};
    Object.entries(rawData).forEach(
      ([key, value]) => (data[key] = Number(value))
    );

    // should check! Omit here
    const edit = {};
    if (this.mode === "edit") {
      edit.coords = {
        lat: Number(rawEdit["lat"]),
        lng: Number(rawEdit["lng"]),
      };
      edit.date = new Date(rawEdit["date"]);
    }

    return { type, data, edit };
  }

  show(mode = "add") {
    if (mode === "edit") {
      this.#parent.classList.add("edit");
    }

    this.#parent.classList.remove("hidden");
    this.#dataFields["distance"].focus();

    this.mode = mode;
    this.id = null;
  }

  hide() {
    this.#parent.style = "display: none";
    this.#parent.classList.add("hidden");
    this.#parent.classList.remove("edit");
    setTimeout(() => (this.#parent.style = "display: grid"), 1000);
    this.mode = null;
  }

  reset() {
    this.#parent.reset();
    this._changeFormType("running");
  }

  _changeFormType(type) {
    const elevGainField = this.#dataFields.elevGain.closest(".form-label");
    const cadenceField = this.#dataFields.cadence.closest(".form-label");

    if (type === "running") {
      elevGainField.classList.add("hidden-field");
      cadenceField.classList.remove("hidden-field");
    } else {
      elevGainField.classList.remove("hidden-field");
      cadenceField.classList.add("hidden-field");
    }
  }

  setValue(workout) {
    this._changeFormType(workout.type);
    this.#typeField.value = workout.type;

    Object.entries(this.#dataFields).forEach(([key, field]) => {
      field.value = workout[key];
    });

    const { lat, lng } = workout.coords;
    this.#editFields.lat.value = lat;
    this.#editFields.lng.value = lng;

    this.#editFields.date.value = workout.date.toISOString().slice(0, 10);
    this.id = workout.id;
  }

  on(eventName, callback) {
    this.#parent.addEventListener(eventName, callback);
  }
}
