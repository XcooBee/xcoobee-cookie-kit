import fetch from "isomorphic-fetch";

import { localeKey, countryCodeKey, xbApiUrl } from "./configs";

const LOCALE_TO_LOCALE = {
  de: "de-de",
  en: "en-us",
  es: "es-419",
  fr: "fr-fr",
};

export function clearLocale() {
  localStorage.removeItem(localeKey);
}

export function clearCountryCode() {
  localStorage.removeItem(countryCodeKey);
}

export function getLocale() {
  let locale = localStorage[localeKey];
  // We used to store "DE", "EN", "ES", and "FR" for locales. Convert to expected
  // value if necessary. This is done for backwards compatibility.
  locale = LOCALE_TO_LOCALE[(locale || "").toLowerCase()] || locale;
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
      const countryCode = res ? res.countryCode : "EU";
      return countryCode;
    });
}

export function fetchCountryCodeForSubscribers(campaignReference) {
  // console.log("LocaleManager#fetchCountryCodeForSubscribers fetching...");
  return fetch(`${xbApiUrl}/geoip?reference=${campaignReference}`)
    .then(res => res.json())
    .then((res) => {
      // console.log("LocaleManager#fetchCountryCodeForSubscribers fetched.");
      const countryCode = res ? res.country : "EU";
      return countryCode;
    });
}
