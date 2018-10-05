export default class Campaign {
  _id = null;
  _name = null;
  _description = null;
  _privacyUrl = null;
  _termsUrl = false;
  _position = "left_bottom";
  _customCss = null;
  _dataTypes = [];

  constructor(campaign) {
    if (!campaign) {
      return;
    }

    this._id = campaign.id;
    this._name = campaign.name;
    this._description = campaign.description;
    this._privacyUrl = campaign.privacyUrl;
    this._termsUrl = campaign.termsUrl;
    this._position = campaign.position;
    this._customCss = campaign.customCss;
    this._dataTypes = campaign.dataTypes;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get privacyUrl() {
    return this._privacyUrl;
  }

  get termsUrl() {
    return this._termsUrl;
  }

  get position() {
    return this._position;
  }

  get customCss() {
    return this._customCss;
  }

  get dataTypes() {
    return this._dataTypes;
  }
}