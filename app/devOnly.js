import { defaultConfig } from "./utils";

import CookieKit from "./index";

const cookieKit = new CookieKit();

const config = {
  ...defaultConfig,
  cssAutoLoad: false,
  cookieHandler: cookieConsents => {
    console.log("cookieHandler:");
    console.dir(cookieConsents);
  },
  privacyUrl: "https://xcoobee.com/privacy",
  termsUrl: "https://xcoobee.com/terms",
};

cookieKit.initialize(config);
