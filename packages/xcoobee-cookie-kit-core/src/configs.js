const xbApiUrl = process.env.XB_API_URL || "https://api.xcoobee.net";

const defaultConfig = {
  checkByDefaultTypes: [],
  cssAutoLoad: true,
  displayOnlyForEU: false,
  expirationTime: 0,
  position: "right_bottom",
  requestDataTypes: ["application"],
  testMode: false,
  textMessage: {
    "en-us": "This site uses cookies. Use this panel to adjust your preferences.",
  },
};

const positions = ["right_bottom", "left_bottom", "right_top", "left_top"];

const cookieDefns = [
  {
    id: 0,
    type: "application",
    dbKey: "application_cookie",
    localeKey: "CookieKit.ApplicationCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/application-cookies",
  },
  {
    id: 1,
    type: "usage",
    dbKey: "usage_cookie",
    localeKey: "CookieKit.UsageCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/personalization-cookies",
  },
  {
    id: 2,
    type: "statistics",
    dbKey: "statistics_cookie",
    localeKey: "CookieKit.StatisticsCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/statistics-cookies",
  },
  {
    id: 3,
    type: "advertising",
    dbKey: "advertising_cookie",
    localeKey: "CookieKit.AdvertisingCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/advertising-and-marketing-cookies",
  },
];

const cookieTypes = cookieDefns.map(defn => defn.type);

const locales = ["EN", "DE", "FR", "ES"];

const tokenKey = "xcoobeeAccessToken";
const xcoobeeCookiesKey = "xcoobeeCookies";

const links = {
  poweredBy: "https://www.xcoobee.com",
  login: "/auth/minlogin",
  manage: "/user/consentCenter/cookies",
};

const animations = {
  cached: "green",
  crowdAi: "yellow",
  hostsDefaults: "red",
  usersDefaults: "blue",
  usersSaved: "green",
  unknown: "default",
};

const cssHref = "xcoobee-cookie-kit.min.css";

const euCountries = [
  "AT", "BE", "BG", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "GB",
];

const consentsSources = [
  "cached",
  "crowdAi",
  "hostsDefaults",
  "usersDefaults",
  "usersSaved",
  "unknown",
];

const consentStatuses = {
  open: "open",
  complete: "complete",
  closed: "closed",
};

const configFields = [
  "campaignReference",
  "checkByDefaultTypes",
  "companyLogo",
  "cookieHandler",
  "cssAutoLoad",
  "displayOnlyForEU",
  "expirationTime",
  "hideBrandTag",
  "hideOnComplete",
  "position",
  "privacyUrl",
  "requestDataTypes",
  "targetUrl",
  "termsUrl",
  "testMode",
  "textMessage",
];
const requiredFields = ["privacyUrl", "termsUrl", "textMessage"];

// Expiration time of cookie consents cached locally (in milliseconds)
const expirationTime = 86400000;

export {
  animations,
  configFields,
  consentsSources,
  consentStatuses,
  cookieDefns,
  cookieTypes,
  cssHref,
  defaultConfig,
  euCountries,
  expirationTime,
  links,
  locales,
  positions,
  requiredFields,
  tokenKey,
  xbApiUrl,
  xcoobeeCookiesKey,
};
