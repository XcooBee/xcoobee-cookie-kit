/* global XcooBee */
/**
 * Sets cookies
 *
 * @param {String} name the name of cookie
 * @param {String} value the value of cookie
 * @param {Number} days optional: the number of days to persist cookie, if not provided will become session cookie
 */
function xckSetCookie(name, value, days) {
  let expires = "";

  if (days) {
    const date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

/**
 * Deletes cookie with given name
 *
 * @param {String} name the name of cookie
 */
function xckEraseCookie(name) {
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
}

/**
 * Retrieves array of cookie names
 *
 * @returns {Array} array of cookie names
 */
function xckGetCookieNames() {
  const ca = document.cookie.split(";");
  const ra = [];

  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].split("=")[0].trim();

    ra.push(c);
  }
  return ra;
}

/**
 * Compares two arrays, return array of elements contained in newArray not part of oldArray
 *
 * @param {Array} oldArray the initial array to compare against
 * @param {Array} newArray the second array. Only elements from this array will be returned
 * @returns {Array} array of elements only contained in newArray
 */
function xckReturnNewElements(oldArray, newArray) {
  const ra = [];

  for (let i = 0; i < newArray.length; i++) {
    const item = newArray[i];

    if (oldArray.indexOf(item) === -1) {
      ra.push(item);
    }
  }
  return ra;
}

/**
 * Updates our local store with cookies that have been set for a given category so far
 *
 * @param {Array} aInitialCookies - The array of cookies that were set before script was run
 * @param {String} category - cookie category related to this load
 */
function xckSaveCookieState(aInitialCookies, category) {
  const aNewCookies = xckGetCookieNames();
  const aAddedCookies = xckReturnNewElements(aInitialCookies, aNewCookies);

  // Check what cookies are set now and save this to our local store
  if (typeof category !== "undefined") {
    // Load and save the cookies set for this category
    const storeName = `xck_cat_${category}`;
    let currentCategoryCookies = localStorage.getItem(storeName);

    if (aAddedCookies.length > 0) {
      if (currentCategoryCookies === null) {
        currentCategoryCookies = aAddedCookies.join();
      } else {
        currentCategoryCookies = `${currentCategoryCookies},${aAddedCookies.join()}`;
      }
      localStorage.setItem(storeName, currentCategoryCookies);
    }
  }
}

/**
 * Loads Javascript. Can load from remote file or code.
 *
 * @param {Object} loadScripts - The HTMLCollection of script tags to be loaded
 * @param {String} category - cookie category related to this load
 */
function xckLoadJs(loadScripts, category) {
  const aInitialCookies = xckGetCookieNames();

  if (loadScripts.length > 0) {
    for (let i = 0; i < loadScripts.length; i++) {
      const item = loadScripts[i];
      const script = document.createElement("script");

      if (item.src === "") {
        script.text = item.text;
      } else {
        // Load from file
        script.async = true; // we always load async
        script.src = item.src;
        // After script is loaded we need to process the cookie state
        script.onload = function onload() {
          if (XcooBee.kit.getParam("testMode") && (item.src !== "")) {
            // eslint-disable-next-line no-console
            console.log(`Cookie script from ${item.src} is ready!`);
          }
          xckSaveCookieState(aInitialCookies, category);
        };
        // Other elements
        if (item.integrity !== "") {
          script.integrity = item.integrity;
        }
        if (item.crossOrigin !== "") {
          script.crossOrigin = item.crossOrigin;
        }
      }
      // Now append to document for execution and save cookie state
      document.body.appendChild(script);

      if (item.src === "") {
        xckSaveCookieState(aInitialCookies, category);
      }
    }
  }
}

/**
 * Removes cookies for categories without consent.
 * Clears all cookies crated by scripts that have no longer consent from user.
 *
 * @param {Object} cookieTypes - The object collection of cookie categories consented by user
 */
function xckClearCookies(cookieTypes) {
  const entries = Object.entries(cookieTypes);

  for (let i = 0; i < entries.length; i++) {
    const category = entries[i];
    const storeName = `xck_cat_${category[0]}`;

    // Check whether we need to delete the category
    if (!category[1]) {
      const currentSetCookies = localStorage.getItem(storeName);

      if (currentSetCookies !== null) {
        const cookies = currentSetCookies.split(",");

        // Iterate and delete
        for (let j = 0; j < cookies.length; j++) {
          xckEraseCookie(cookies[j]);
        }
        // Clear local storage
        localStorage.removeItem(storeName);
      }
    }
  }
}

/**
 * Parse html encoded script directives
 *
 * @param {Array} htmlData - string with script tags to be loaded
 * @return {Object} the fully parsed html elements in HtmlCollection
 */
function xckParseHtml(htmlData) {
  // Parse encoded via text area
  const txt = document.createElement("textarea");
  txt.innerHTML = htmlData;

  // Now add this as html to our shadow doc
  const el = document.createElement("html");
  el.innerHTML = txt.innerText;

  return el;
}

/**
 * Scans document for HTML defined xbee-script tags and converts them into
 * scripts that will be loaded once user grants consent. Will also look for
 * unset scripts when user removes consent.
 *
 * @param {Object} cookieTypes object with true/false for each user cookie type.
 * Example Object { application: false, usage: true, statistics: false, advertising: false }
 */
function xckHandleXbeeScriptTags(cookieTypes) {
  const xbeCookieScripts = document.getElementsByTagName("xbee-script");
  let i = 0;
  let resolvedScripts = "";

  if (xbeCookieScripts.length > 0 && (XcooBee.kit.getConsentStatus() === "complete")) {
    for (i = 0; i < xbeCookieScripts.length; i++) {
      const item = xbeCookieScripts[i];
      let script = item.outerHTML;

      resolvedScripts = "";

      try {
        // We use this notation to cause error when required attributes are not present
        const scriptAction = item.attributes.action.value;
        const scriptCategory = item.attributes.category.value;

        // For setting continue if user has responded, we are allowed the category, and action matches
        if ((scriptAction === "set") && (cookieTypes[scriptCategory])) {
          // Replace xbee-script with script
          script = script.replace(/xbee-script/ig, "script");
          resolvedScripts += script;
        }
        // For un-setting getCookieTypes() has to be false we use separate condition for easier readability
        if ((scriptAction === "unset") && (!cookieTypes[scriptCategory])) {
          // Replace xbee-script with script
          script = script.replace(/xbee-script/ig, "script");
          resolvedScripts += script;
        }
        // Parse and load text scripts if we can find them
        if (resolvedScripts !== "") {
          const runnableScripts = xckParseHtml(resolvedScripts);
          // Load scripts presumably to set cookies
          xckLoadJs(runnableScripts.getElementsByTagName("script"), scriptCategory);
        }
      } catch (error) {
        // Error happened
        const msg = "Tag caused error, please make sure you have supplied required attributes:";
        console.error(msg, script.substr(0, 40));
        if (XcooBee.kit.getParam("testMode")) {
          console.error(error);
        }
      }
    }
  }
}

/**
 * Scans document for HTML defined xbee-cookie tags and sets or removes cookies
 * once user grants consent.
 *
 * @param {Object} cookieTypes object with true/false for each user cookie category.
 * Example Object { application: false, usage: true, statistics: false, advertising: false }
 */
function xckHandleXbeeCookieTags(cookieTypes) {
  const xbeCookieTags = document.getElementsByTagName("xbee-cookie");
  let i = 0;

  if (xbeCookieTags.length > 0 && (XcooBee.kit.getConsentStatus() === "complete")) {
    for (i = 0; i < xbeCookieTags.length; i++) {
      const item = xbeCookieTags[i];
      let cookieValue = item.innerHTML;
      const itemOuter = item.outerHTML;

      try {
        // We use the array notation since it will throw error  when we have missing required attributes
        cookieValue = cookieValue.replace(/\r?\n|\r/g, ""); // Remove CRLF
        const cookieName = item.attributes.name.value;
        const cookieCategory = item.attributes.category.value;
        let cookieDays = 0;

        // Days is optional so we use this notation to retrieve it
        if (item.attributes.getNamedItem("days") !== null) {
          cookieDays = parseInt(item.attributes("days"), 10);
        }
        // Set or erase this cookie based on whether category is allowed
        if (cookieTypes[cookieCategory]) {
          // Set cookie
          xckSetCookie(cookieName, cookieValue, cookieDays);
        } else {
          // Erase cookie
          xckEraseCookie(cookieName);
        }
      } catch (error) {
        // Error happened
        console.error("error in cookie definition in tag:", itemOuter.substr(0, 30));
        if (XcooBee.kit.getParam("testMode")) {
          console.error(error);
        }
      }
    }
  }
}

export default {
  xckClearCookies,
  xckHandleXbeeScriptTags,
  xckHandleXbeeCookieTags,
};
