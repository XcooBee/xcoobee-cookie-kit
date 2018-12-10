const defaultConfig = {
  checkByDefaultTypes: ["application"],
  cssAutoLoad: true,
  displayOnlyForEU: false,
  expirationTime: 0,
  position: "right_bottom",
  requestDataTypes: ["application"],
  testMode: false,
  textMessage: { "en-us": "This site uses cookies. Use this panel to adjust your preferences." },
};
const positions = ["right_bottom", "left_bottom", "right_top", "left_top"];
const cookieTypes = [
  {
    id: 0,
    key: "application",
    dbKey: "application_cookie",
    localeKey: "CookieKit.ApplicationCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/application-cookies",
  },
  {
    id: 1,
    key: "usage",
    dbKey: "usage_cookie",
    localeKey: "CookieKit.UsageCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/personalization-cookies",
  },
  {
    id: 2,
    key: "statistics",
    dbKey: "statistics_cookie",
    localeKey: "CookieKit.StatisticsCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/statistics-cookies",
  },
  {
    id: 3,
    key: "advertising",
    dbKey: "advertising_cookie",
    localeKey: "CookieKit.AdvertisingCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/advertising-and-marketing-cookies",
  },
];
const locales = ["EN", "DE", "FR", "ES"];
const tokenKey = "xcoobeeAccessToken";
const xcoobeeCookiesKey = "xcoobeeCookies";
const links = {
  poweredBy: "https://www.xcoobee.com",
  login: "https://testapp.xcoobee.net/auth/minlogin",
  manage: "https://testapp.xcoobee.net/user/consentCenter/cookies",
};
const animations = {
  noAnimation: "default",
  userPreference: "blue",
  userSettings: "green",
  crowdIntelligence: "yellow",
  companyPreference: "red",
};
const cssHref = "xcoobee-cookie-kit.min.css";
const euCountries = ["AT", "BE", "BG", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB"];
const requiredFields = ["privacyUrl", "termsUrl", "textMessage"];
const consentStatuses = {
  open: "open",
  complete: "complete",
  closed: "closed",
};
// eslint-disable-next-line
const configFields = ["campaignReference", "checkByDefaultTypes", "companyLogo", "cookieHandler", "displayOnlyForEU", "expirationTime", "hideOnComplete", "position", "privacyUrl", "requestDataTypes", "targetUrl", "termsUrl", "testMode", "textMessage"];
// Expiration time of cookie preferences saved locally (in milliseconds)
const expirationTime = 86400000;

export {
  animations,
  cookieTypes,
  configFields,
  consentStatuses,
  cssHref,
  defaultConfig,
  euCountries,
  expirationTime,
  links,
  locales,
  requiredFields,
  tokenKey,
  xcoobeeCookiesKey,
  positions,
};
