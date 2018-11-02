import "./style/main.scss";

import CookieKit from "./model/CookieKit";

if (!window.XcooBee) {
  window.XcooBee = {};
}
window.XcooBee.kit = new CookieKit();
