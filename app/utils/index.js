const defaultConfig = {
  campaignReference: "ce84ab7f7b737d",
  checkByDefaultTypes: [],
  companyLogo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAwNzQ1RERGNjUzNjExRTdCREZGRTM2MUMyNTZCMDJBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAwNzQ1REUwNjUzNjExRTdCREZGRTM2MUMyNTZCMDJBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDA3NDVEREQ2NTM2MTFFN0JERkZFMzYxQzI1NkIwMkEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDA3NDVEREU2NTM2MTFFN0JERkZFMzYxQzI1NkIwMkEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz44gNZUAAAFgklEQVR42txabWxTVRh++zW6D+YYY4wpozDmcHMLI4CfkUwwIULEkAxEw4xmuMQElUSriPjDSqbDP8bwAzQh2/yhkDA/2A+GdfwYzlRk6lizrTI32IZzH2zV0q5bN99z7225tPf2nnPbbmVP8p506zn3nOec837eamZmZmA+QE8ajUYT+ZMsVhO2pSiPoOSj5KGkoiQLPVwoThQHSidKC0oTHN7cE+nU5DA0XKOWiMWaje1elHKUApXrsKPUotQhqYHZJWKx5mJrRnkJxRCl2zGJchKlGgldjS0RizUR24Mob6MkxOi6e1E+RqlCQu7oE7FYi7A9Ldz/2QDRozIk00ZDREt5EkQHbLNIAoS5bMLcitBSkHgL2xoU4xxYVSM3N7+GCIjwD6iOAzdRrURGXkf4I62JM7/3IupMLb2y84ptm6PrFA4elI3BBkCaCG9iW2dZsVmtWYnYNMtZrYOxJqHFjUvQacGgVRVR5AtrDKMjvMe2yzk7PU48Na0+yHx69WI48NBy2LRiUYDE0K1J+Ly1H44098KtSR/3vwVI8tn8JXDKPggz8k6zwB8BEA76oA7mcB67oiQbTPcY4Z0fmSII0OFGndi2Bl5euyzkuyVJBnj3MRNsWZkOVRd7odS0CPYULoWzjmH4GonIIEFYa2XoifABYE+42On73cWwPS8DPvulD95odMA0ZQpwbGs+vLr+Xmrifc4JWPeFDUbcU+HmILGZiQSawTqyVykAXJ7KG7H9G+6D+rIiSDPqFRdVnJnCRIJcr5o/bsDRLavhucLMcF0NwppDHKJiKDDhmw58fub+DGit2AhPrUoPO2bPg0uZrmGSQQeHHjdBEW7AmY4hpe7ldxLhkyLFfKJ9yHXH36Y0IzQ+vxa+2VUM67IWSo7JS09iNgo//DUKT9a1gmdqWqlrgbD2wImU0kxAFFAKO/B0fq3YwMmbD+dwpHSCJfRbIha8fs4B4xNTtN1LA6mukJ4q4ruuYbAPu6AgI1nye0LAfzJu3M2eMTekJOiYiTCQ8K/9pFbkZBRBTOS+sx1w06M8UaJeCw8gYb+BoIUPLdCgy8vqIAMnkkczglifbejUKO6uavSMeVidbp5YR1JpRvx0fZwLL4hliRUu3XCyDkkVE0mmGfHllb/B64vdaRBcxM1iRDJdhhjkcQ81dceUyLddw+oCUVHxjAqf/HwN9p/riomeNF8fg2vjHtZhLjERpovZeHUU9jV0hDjISHHsUr+aYU6x1SJlzGX0YYQW6nYURJUE2ZRT9n/UDHWIT6STZeRvg//B8cv9USVy4Dx9NC2RMQaItLCOfg3DiPrOoaiQOHF5AM53j6od3iIm0sQ6mpjhnafbYPeZK3Ch96Zqs9zSN46b0hXJPjQFJ1btoLKiTpwkSWGrN+dyn2lhG3DC9q9+59JdlbBjYlUYnOqSetFHLE8h8dTONZlgfjSHS6BY0PDnCLxQ384aIAYjUOMSE6kjmYlclrgyLRE2rUjjChA5GAiuz14IT+SkQTJjuELC+vcudMOntj61yi1OdevkqijHsX1FbuTW3MVwpHSVbBIVDiSsr8UU9sPmHi5CiIaNwGtVKV2gUygH+UFOorw4CyPhDMhKke/6r9fHGYIGxwhXERnzTEGUEFIOkqo0foDtYerQc4Ee0hP1qC860Aj5BNl9smjnRNQWHgwLknhfXGmUKoNUoeyiTbbIYmO4YDkHWCUXNN4GX1MtA75gHG/wAP8Wy61MhCfTJq7ixREq5V7Fyecj/HsIcxyRMEu9G1EmwpM5GidkzMJaZEH3Vpd/e0V8jHEOdKIy3EnIm195MvPg9fRtA1AihDHeGBLwCnOU0JBgu1qhp3OX/4QjlNBd/qMaaVImmOufOc0H/C/AALfMSGyAt+BfAAAAAElFTkSuQmCC",
  cookieHandler: () => {},
  cssAutoLoad: true,
  displayOnlyForEU: true,
  expirationTime: 0,
  position: "left_bottom",
  privacyUrl: "https://lviv.com/policy",
  requestDataTypes: ["application_cookie", "statistics_cookie", "usage_cookie"],
  targetUrl: null,
  termsUrl: "https://lviv.com/terms",
  testMode: true,
  textMessage: { "en-us": "This site uses cookies. Use this panel to adjust your preferences." },
};
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
  login: "https://testapp.xcoobee.net/auth/minlogin",
  manage: "https://testapp.xcoobee.net/user/consentCenter/consent",
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
const configFields = ["campaignReference", "checkByDefaultTypes", "companyLogo", "cookieHandler", "displayOnlyForEU", "expirationTime", "position", "privacyUrl", "requestDataTypes", "targetUrl", "termsUrl", "testMode", "textMessage"];

export {
  animations,
  cookieTypes,
  configFields,
  consentStatuses,
  cssHref,
  defaultConfig,
  euCountries,
  links,
  locales,
  requiredFields,
  tokenKey,
  xcoobeeCookiesKey,
};
