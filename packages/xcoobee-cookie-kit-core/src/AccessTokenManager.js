import { tokenKey } from "./configs";

export function clearAccessToken() {
  localStorage.removeItem(tokenKey);
}

export function getAccessToken() {
  const accessToken = localStorage[tokenKey];
  return accessToken;
}

export function saveAccessToken(accessToken) {
  localStorage.setItem(tokenKey, accessToken);
}
