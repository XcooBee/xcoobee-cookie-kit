export default class XcoobeeCookie {
  _name = null;
  _allowed = false;
  _cookieHandler = () => {};

  constructor({ name, allowed, cookieHandler } = {}) {
    this._name = name;
    this._allowed = allowed || false;
    this._cookieHandler = cookieHandler || (() => {});
  }

  get name() {
    return this._name;
  }

  get allowed() {
    return this._allowed;
  }

  get cookieHandler() {
    return this._cookieHandler;
  }

  get json() {
    return {
      name: this._name,
      allowed: this._allowed,
      cookieHandler: this._cookieHandler
    };
  }

  set allowed(isAllowed) {
    this._allowed = isAllowed;
  }

  setCookieHandler(handler) {
    this._cookieHandler = handler;
  }
}
