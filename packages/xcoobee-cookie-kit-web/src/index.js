import React from "react";
import ReactDOM from "react-dom";
import {
  consentStatuses,
  configFields,
  defaultConfig,
  requiredFields,
} from "xcoobee-cookie-kit-core/src/configs";
import CookieKitContainer from "xcoobee-cookie-kit-react/src";

import "xcoobee-cookie-kit-react/src/xck-react.scss";

function checkRequiredFields(config) {
  const errors = [];

  requiredFields.forEach((field) => {
    if (!config[field]) {
      errors.push(`${field} field is required as initialization parameter.`);
    }
  });

  if (!config.cookieHandler && !config.targetUrl) {
    errors.push("One of `cookieHandler` or `targetUrl` fields is required as initialization parameter.");
  }

  if (errors.length > 0) {
    errors.forEach(errorMessage => console.error(errorMessage));
    return false;
  }

  const reference = config.campaignReference;
  const referenceType = typeof reference;
  if (
    (reference !== undefined && referenceType !== "string")
    || (referenceType === "string" && reference.length === 0)
  ) {
    errors.push("Invalid campaign reference");
  }

  return true;
}

class CookitKitInitializer {
  _compRef = React.createRef();

  _config = {
    ...defaultConfig,
    checkByDefaultTypes: [...defaultConfig.checkByDefaultTypes],
    requestDataTypes: [...defaultConfig.requestDataTypes],
    textMessage: {
      ...defaultConfig.textMessage,
    },
  };

  initialize(cfg) {
    const config = {
      ...this._config,
      ...cfg,
    };

    this._config = config;
  }

  getParam(field) {
    if (!configFields.includes(field)) {
      console.error(`${field} parameter is not valid.`);
      return undefined;
    }

    return this._config[field];
  }

  setParam(field, value) {
    if (!configFields.includes(field)) {
      console.error(`${field} parameter is not valid.`);
      return;
    }
    this._config[field] = value;
  }

  getConsentStatus() {
    let consentStatus;
    if (this._compRef.current) {
      consentStatus = this._compRef.current.getConsentStatus();
    }
    return consentStatus || consentStatuses.open;
  }

  getCookieTypes() {
    let consentSettings;
    if (this._compRef.current) {
      consentSettings = this._compRef.current.getCookieTypes();
    }
    return consentSettings || {};
  }

  render(dom = document.body) {
    const appendCookieKit = () => {
      if (!checkRequiredFields(this._config)) {
        throw Error("Configuration invalid.");
      }
      const placeHolderDom = document.createElement("div");

      placeHolderDom.className = "xb-cookie-kit-placeholder";

      ReactDOM.render(
        <CookieKitContainer
          ref={this._compRef}
          {...this._config}
        />,
        placeHolderDom,
      );
      dom.appendChild(placeHolderDom);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", appendCookieKit);
    } else {
      appendCookieKit();
    }
  }
}

if (!window.XcooBee) {
  window.XcooBee = {};
}
if (!window.XcooBee.kit) {
  window.XcooBee.kit = new CookitKitInitializer();
}
