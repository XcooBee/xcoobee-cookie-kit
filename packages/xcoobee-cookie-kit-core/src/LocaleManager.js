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
