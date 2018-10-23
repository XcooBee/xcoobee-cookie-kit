const cookieTypes = [
  { id: 0, key: "application_cookie", amount: 1, model: "application", localeKey: "CookieKit.ApplicationCookieName" },
  { id: 1, key: "usage_cookie", amount: 1, model: "usage", localeKey: "CookieKit.UsageCookieName" },
  { id: 2, key: "statistics_cookie", amount: 2, model: "statistics", localeKey: "CookieKit.StatisticsCookieName" },
  { id: 3, key: "advertising_cookie", amount: 1, model: "advertising", localeKey: "CookieKit.AdvertisingCookieName" }
];
const locales = ["EN", "DE", "FR", "ES"];
const tokenKey = "xcoobeeAccessToken";
const xcoobeeCookiesKey = "xcoobeeCookies";
const links = {
  poweredBy: "https://www.xcoobee.com",
  login: "http://localhost:3000/auth/minlogin",
  manage: "https://testapp.xcoobee.net/user/consentCenter/consent"
};
const defaultConfig = {
  campaignId: null,
  position: "left_bottom",
  termsUrl: "https://lviv.com/terms",
  privacyUrl: "https://lviv.com/policy",
  expirationTime: 120,
  companyLogoUrl: "https://res-1.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_120,w_120,f_auto,b_white,q_auto:eco/v1506455567/rzmsg3oyifgkbl1ywrql.png"
};
const defaultMessage = "This site uses cookies. Use this panel to adjust your preferences.";
const animations = {
  noAnimation: null,
  defaultOptions: "blue",
  knownSite: "green",
  crowdIntelligence: "yellow",
  euTraffic: "red"
};
const apiUrl = "https://api.xcoobee.net";
const euCountries = ["AT", "BE", "BG", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB"];

export {
  cookieTypes,
  locales,
  tokenKey,
  links,
  xcoobeeCookiesKey,
  defaultConfig,
  defaultMessage,
  animations,
  apiUrl,
  euCountries
};