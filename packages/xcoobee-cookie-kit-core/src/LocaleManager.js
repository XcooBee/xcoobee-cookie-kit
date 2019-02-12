import { localeKey, countryCodeKey, xbApiUrl } from "./configs";

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

export function fetchCountryCodeForSubscribers(campaignReference) {
  // console.log("LocaleManager#fetchCountryCodeForSubscribers fetching...");
  const options = { method: "GET" };

  return fetch(`${xbApiUrl}/geoip?reference=${campaignReference}`, options)
    .then(res => res.json())
    .then((res) => {
      // console.log("LocaleManager#fetchCountryCodeForSubscribers fetched.");
      const countryCode = res ? res.country : "EU";
      return countryCode;
    });
}
