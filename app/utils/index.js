const cookieTypes = [
  {
    id: 0,
    key: "application_cookie",
    model: "application",
    localeKey: "CookieKit.ApplicationCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/application-cookies",
  },
  {
    id: 1,
    key: "usage_cookie",
    model: "usage",
    localeKey: "CookieKit.UsageCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/personalization-cookies",
  },
  {
    id: 2,
    key: "statistics_cookie",
    model: "statistics",
    localeKey: "CookieKit.StatisticsCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/statistics-cookies",
  },
  {
    id: 3,
    key: "advertising_cookie",
    model: "advertising",
    localeKey: "CookieKit.AdvertisingCookieName",
    url: "https://www.xcoobee.com/docs/xcoobee-concepts/cookies/advertising-and-marketing-cookies",
  },
];
const locales = ["EN", "DE", "FR", "ES"];
const tokenKey = "xcoobeeAccessToken";
const xcoobeeCookiesKey = "xcoobeeCookies";
const links = {
  poweredBy: "https://www.xcoobee.com",
  login: "http://localhost:3000/auth/minlogin",
  manage: "https://testapp.xcoobee.net/user/consentCenter/consent",
};
const defaultConfig = {
  campaignReference: "ce84ab7f7b737d",
  campaignName: "https://lviv.com",
  position: "left_bottom",
  termsUrl: "https://lviv.com/terms",
  privacyUrl: "https://lviv.com/policy",
  expirationTime: 0,
  cssAutoLoad: true,
  testMode: true,
  companyLogoUrl: "https://res-1.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_120,w_120,f_auto,b_white,q_auto:eco/v1506455567/rzmsg3oyifgkbl1ywrql.png",
  cookiesDisplayOptions: [
    { type: "application_cookie", show: true, checked: false },
    { type: "statistics_cookie", show: true, checked: false },
    { type: "usage_cookie", show: true, checked: false },
    { type: "advertising_cookie", show: true, checked: false },
  ],
  targetUrl: "https://lviv.com",
  textMessage: "This site uses cookies. Use this panel to adjust your preferences.",
};
const animations = {
  noAnimation: "default",
  defaultOptions: "blue",
  knownSite: "green",
  crowdIntelligence: "yellow",
  euTraffic: "red",
};
const cssHref = "xcoobee-cookie-kit.min.css";
const euCountries = ["AT", "BE", "BG", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB"];

export {
  cookieTypes,
  locales,
  tokenKey,
  links,
  xcoobeeCookiesKey,
  defaultConfig,
  animations,
  cssHref,
  euCountries,
};
