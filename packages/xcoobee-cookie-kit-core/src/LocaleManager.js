import { localeKey, countryCodeKey } from "./configs";

export function clearLocale() {
  localStorage.removeItem(localeKey);
}

export function clearCountryCode() {
  localStorage.removeItem(countryCodeKey);
}

export function getLocale() {
  const locale = localStorage[localeKey];
  return locale;
}

export function getCountryCode() {
  const countryCode = localStorage[countryCodeKey];
  return countryCode;
}

export function saveLocale(locale) {
  localStorage.setItem(localeKey, locale);
}

export function saveCountryCode(countryCode) {
  localStorage.setItem(countryCodeKey, countryCode);
}

export function fetchCountryCode() {
  // console.log("LocaleManager#fetchCountryCode fetching...");
  return fetch("http://ip-api.com/json")
    .then(res => res.json())
    .then((res) => {
      // console.log("LocaleManager#fetchCountryCode fetched.");
      const countryCode = res ? res.countryCode : "US";
      return countryCode;
    });
}
