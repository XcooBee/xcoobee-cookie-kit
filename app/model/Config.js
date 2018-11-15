import Cookie from "./Cookie";

export default class Config {
  _campaignReference = null;

  _checkByDefaultTypes = [];

  _companyLogo = null;

  _cookieHandler = () => null;

  _cookies = [];

  _displayOnlyForEU = false;

  _expirationTime = 0;

  _hideOnComplete = false;

  _position = "left_bottom";

  _privacyUrl = null;

  _requestDataTypes = [];

  _targetUrl = null;

  _termsUrl = false;

  _testMode = false;

  _textMessage = "";

  constructor(config) {
    if (!config) {
      return;
    }

    this._campaignReference = config.campaignReference;
    this._checkByDefaultTypes = config.checkByDefaultTypes;
    this._companyLogo = config.companyLogo;
    this._cookieHandler = config.cookieHandler;
    this._cssAutoLoad = config.cssAutoLoad;
    this._displayOnlyForEU = config.displayOnlyForEU;
    this._expirationTime = config.expirationTime;
    this._hideOnComplete = config.hideOnComplete;
    this._position = config.position;
    this._privacyUrl = config.privacyUrl;
    this._requestDataTypes = config.requestDataTypes;
    this._targetUrl = config.targetUrl;
    this._termsUrl = config.termsUrl;
    this._testMode = config.testMode;
    this._textMessage = config.textMessage;

    this._cookies = config.requestDataTypes.map(type => new Cookie({
      type,
      checked: false,
    }));
  }

  get campaignReference() {
    return this._campaignReference;
  }

  get checkByDefaultTypes() {
    return this._checkByDefaultTypes;
  }

  get companyLogo() {
    return this._companyLogo;
  }

  get cookies() {
    return this._cookies;
  }

  get cookieHandler() {
    return this._cookieHandler;
  }

  get displayOnlyForEU() {
    return this._displayOnlyForEU;
  }

  get expirationTime() {
    return this._expirationTime;
  }

  get hideOnComplete() {
    return this._hideOnComplete;
  }

  get position() {
    return this._position;
  }

  get privacyUrl() {
    return this._privacyUrl;
  }

  get requestDataTypes() {
    return this._requestDataTypes;
  }

  get targetUrl() {
    return this._targetUrl;
  }

  get termsUrl() {
    return this._termsUrl;
  }

  get testMode() {
    return this._testMode;
  }

  get textMessage() {
    return this._textMessage;
  }

  set campaignReference(value) {
    this._campaignReference = value;
  }

  set checkByDefaultTypes(value) {
    this._checkByDefaultTypes = value;
  }

  set companyLogo(value) {
    this._companyLogo = value;
  }

  set cookies(value) {
    this._cookies = value.map(item => new Cookie(item));
  }

  set cookieHandler(value) {
    this._cookieHandler = value;
  }

  set displayOnlyForEU(value) {
    this._displayOnlyForEU = value;
  }

  set expirationTime(value) {
    this._expirationTime = value;
  }

  set hideOnComplete(value) {
    this._hideOnComplete = value;
  }

  set position(value) {
    this._position = value;
  }

  set privacyUrl(value) {
    this._privacyUrl = value;
  }

  set requestDataTypes(value) {
    this._requestDataTypes = value;
    this._cookies = value.map(type => new Cookie({
      type,
      checked: false,
    }));
  }

  set targetUrl(value) {
    this._targetUrl = value;
  }

  set termsUrl(value) {
    this._termsUrl = value;
  }

  set testMode(value) {
    this._testMode = value;
  }

  set textMessage(value) {
    this._textMessage = value;
  }
}
