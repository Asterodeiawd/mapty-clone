class Form {
  #parent;
  #fieldIds = {
    type: "#workout-type",
    data: {
      distance: "#workout-distance",
      duration: "#workout-duration",
      cadence: "#workout-cadence",
      elevGain: "#workout-elev-gain",
    },
  };

  constructor(parentNode) {
    this.#parent = parentNode;
  }

  get type() {
    return this.#parent.querySelector(this.#fieldIds.type).value.toLowerCase();
  }
  _rawData() {
    const data = {};
    Object.keys(this.#fieldIds.data).forEach(key => {
      data[key] = this.#parent.querySelector(this.#fieldIds.data[key]).value;
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
    Object.keys(rawData).forEach(key => (data[key] = Number(rawData[key])));

    return { type, data };
  }

  show() {
    this.#parent.classList.remove("hidden");
  }

  hide() {
    this.#parent.classList.add("hidden");
  }

  _clear() {
    this.#parent.reset();
  }

  _changeFormType() {
    const elevGainField = this.#parent.querySelector(
      this.#fieldIds.data["elevGain"]
    );
    const cadenceField = this.#parent.querySelector(
      this.#fieldIds.data["cadence"]
    );

    if (this.type === "running") {
      elevGainField.closest(".form-label").classList.add("hidden-field");
      cadenceField.closest(".form-label").classList.remove("hidden-field");
    } else {
      elevGainField.closest(".form-label").classList.remove("hidden-field");
      cadenceField.closest(".form-label").classList.add("hidden-field");
    }
  }
}
