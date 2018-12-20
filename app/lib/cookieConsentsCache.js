
import {
  cookieDefns,
  expirationTime,
  xcoobeeCookiesKey,
} from "../utils";

const cookieConsentsCache = {
  clear() {
    // console.log("cookieConsentsCache#clear");
    localStorage.removeItem(xcoobeeCookiesKey);
  },

  put(cookieConsents) {
    // console.log("cookieConsentsCache#put");
    // TODO: Save as a LUT (aka consentSettings) instead of an array.
    const xcoobeeCookies = { timestamp: Date.now(), cookies: [] };
    cookieDefns.forEach((cookieDefn) => {
      const cookieConsent = cookieConsents.find(item => item.type === cookieDefn.type);

      if (cookieConsent && cookieConsent.checked) {
        xcoobeeCookies.cookies.push(true);
      } else {
        xcoobeeCookies.cookies.push(false);
      }
    });
    localStorage.setItem(xcoobeeCookiesKey, JSON.stringify(xcoobeeCookies));
  },

  get() {
    // console.log("cookieConsentsCache#get");
    let cookieConsents = null;

    if (localStorage[xcoobeeCookiesKey]) {
      try {
        const xcoobeeCookies = JSON.parse(localStorage[xcoobeeCookiesKey]);
        const { cookies: consents, timestamp } = xcoobeeCookies;

        // If the cached cookie consents have not expired, then extract it.
        if ((Date.now() - timestamp) < expirationTime) {
          cookieConsents = cookieDefns.map(cookieDefn => ({
            type: cookieDefn.type,
            checked: consents[cookieDefn.id],
          }));
        }
      } catch (err) {
        cookieConsents = null;
        console.error(err);
      }
    }

    return cookieConsents;
  },
};

export default cookieConsentsCache;
