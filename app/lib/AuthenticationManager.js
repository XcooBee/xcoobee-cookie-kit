import { tokenKey } from "../utils";

class AuthenticationManager {
  static clearAccessToken() {
    localStorage.removeItem(tokenKey);
  }

  static getAccessToken() {
    const accessToken = localStorage[tokenKey];
    return accessToken;
  }

  static saveAccessToken(accessToken) {
    localStorage.setItem(tokenKey, accessToken);
  }
}

export default AuthenticationManager;
