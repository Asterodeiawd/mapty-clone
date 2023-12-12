class Form {
  #parent;
  #typeField;
  #dataFields = {};

  constructor(parentSelector) {
    const dataFieldIds = {
      distance: "#workout-distance",
      duration: "#workout-duration",
      cadence: "#workout-cadence",
      elevGain: "#workout-elev-gain",
    };

    this.#parent = document.querySelector(parentSelector);
    this.#typeField = this.#parent.querySelector("#workout-type");

    Object.entries(dataFieldIds).forEach(([key, value]) => {
      this.#dataFields[key] = this.#parent.querySelector(value);
    });

    this.#typeField.addEventListener("change", () => {
      this._changeFormType();
      // this._clear();
    });
  }

  get type() {
    return this.#typeField.value.toLowerCase();
  }

  _rawData() {
    const data = {};
    Object.entries(this.#dataFields).forEach(([key, field]) => {
      data[key] = field.value;
    });

    return { type: this.type, data };
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
    const { type, data: rawData } = this._rawData();
    delete rawData[type === "running" ? "elevGain" : "cadence"];

    const dataValues = Object.values(rawData);

    if (!Form._checkValid(dataValues) || !Form._checkPositive(dataValues))
      throw Error("values must be positive numbers");

    const data = {};
    Object.entries(rawData).forEach(
      ([key, value]) => (data[key] = Number(value))
    );

    return { type, data };
  }

  show() {
    this.#parent.classList.remove("hidden");
    this.#dataFields["distance"].focus();
  }

  hide() {
    this.#parent.style = "display: none";
    this.#parent.classList.add("hidden");
    setTimeout(() => (this.#parent.style = "display: grid"), 1000);
  }

  reset() {
    this.#parent.reset();
    this._changeFormType();
  }

  _changeFormType() {
    const elevGainField = this.#dataFields.elevGain.closest(".form-label");
    const cadenceField = this.#dataFields.cadence.closest(".form-label");

    if (this.type === "running") {
      elevGainField.classList.add("hidden-field");
      cadenceField.classList.remove("hidden-field");
    } else {
      elevGainField.classList.remove("hidden-field");
      cadenceField.classList.add("hidden-field");
    }
  }

  on(eventName, callback) {
    this.#parent.addEventListener(eventName, callback);
  }
}
