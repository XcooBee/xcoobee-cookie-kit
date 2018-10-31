export default class Cookie {
  _type = null;

  _checked = false;

  constructor(data) {
    if (!data) {
      return;
    }

    this._type = data.type;
    this._checked = data.checked;
  }

  get type() {
    return this._type;
  }

  get checked() {
    return this._checked;
  }

  set checked(isAllowed) {
    this._checked = isAllowed;
  }
}
