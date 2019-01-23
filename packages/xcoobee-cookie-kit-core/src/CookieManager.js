function xckSetCookie(name, value, days) {
  let expires = "";

  if (days) {
    let date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function xckEraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
}

function xckGetCookieNames() {
  let ca = document.cookie.split(';');
  let ra = [];

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].split("=")[0].trim();

    ra.push(c);
  }
  return ra;
}

function xckReturnNewElements(oldArray, newArray) {
  let ra = [];

  for (let i = 0; i < newArray.length; i++) {
    let item = newArray[i];

    if (oldArray.indexOf(item)===-1) {
      ra.push(item);
    }
  }
  return ra;
}

function xckSaveCookieState(aInitialCookies,category) {
  let aNewCookies = xckGetCookieNames();
  let aAddedCookies = xckReturnNewElements(aInitialCookies,aNewCookies);

  // Check what cookies are set now and save this to our local store
  if (typeof category !== "undefined") {
    // Load and save the cookies set for this category
    let storeName = "xck_cat_" + category;
    let currentCategoryCookies = localStorage.getItem(storeName);

    if (aAddedCookies.length > 0 ) {
      if (currentCategoryCookies === null) {
        currentCategoryCookies = aAddedCookies.join();
      } else {
        currentCategoryCookies = currentCategoryCookies + "," + aAddedCookies.join();
      }
      localStorage.setItem(storeName, currentCategoryCookies);
    }
  }
}

function xckLoadJs(loadScripts, category) {
  let aInitialCookies = xckGetCookieNames();

  if (loadScripts.length > 0) {
    for (let i = 0; i < loadScripts.length; i++) {
      let item = loadScripts[i];
      let script = document.createElement("script");

      if (item.src === "") {
        script.text = item.text;
      } else {
        // Load from file
        script.async = true; // we always load async
        script.src = item.src;
        // After script is loaded we need to process the cookie state
        script.onload = function () {
          if (XcooBee.kit.getParam("testMode") && (item.src !== "")) {
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

// Clear all cookies crated by scripts that have no longer consent from user
function xckClearCookies(cookieTypes) {
  const entries = Object.entries(cookieTypes);

  for (let i = 0; i < entries.length; i++) {
    let category = entries[i];
    let storeName = "xck_cat_" + category[0];

    // Check whether we need to delete the category
    if (!category[1]) {
      let currentSetCookies = localStorage.getItem(storeName);

      if (currentSetCookies !== null) {
        let cookies = currentSetCookies.split(",");

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

// Call handler for scripts encoded in HTML as xbee-script
function xckHandleXbeeScriptTags(cookieTypes) {
  let xbeCookieScripts = document.getElementsByTagName("xbee-script");
  let i = 0;
  let resolvedScripts = "";

  if (xbeCookieScripts.length > 0 && (XcooBee.kit.getConsentStatus() === "complete")) {
    for (i = 0; i < xbeCookieScripts.length; i++) {
      let item = xbeCookieScripts[i];
      let script = item.outerHTML;

      resolvedScripts = "";

      try {
        // We use this notation to cause error when required attributes are not present
        let scriptAction = item.attributes["action"].value;
        let scriptCategory = item.attributes["category"].value;

        // For setting continue if user has responded, we are allowed the category, and action matches
        if ((scriptAction === "set") && (cookieTypes[scriptCategory])) {
          // Replace xbee-script with script
          script = script.replace(/xbee-script/ig, "script");
          resolvedScripts = resolvedScripts + script;
        }
        // For un-setting getCookieTypes() has to be false we use separate condition for easier readability
        if ((scriptAction === "unset") && (!cookieTypes[scriptCategory])) {
          // Replace xbee-script with script
          script = script.replace(/xbee-script/ig, "script");
          resolvedScripts = resolvedScripts + script;
        }
        // Parse and load text scripts if we can find them
        if (resolvedScripts !== "") {
          let runnableScripts = xckParseHtml(resolvedScripts);
          // Load scripts presumably to set cookies
          xckLoadJs(runnableScripts.getElementsByTagName("script"),scriptCategory);
        }
      } catch (error) {
        // Error happened
        console.log("Tag caused error, please make sure you have supplied required attributes:", script.substr(0,40));
        if (XcooBee.kit.getParam("testMode")) {
          console.log(error);
        }
      }
    }
  }
}

// Call handler for cookies encoded in HTML as "xbee-cookie"
function xckHandleXbeeCookieTags(cookieTypes) {
  let xbeCookieTags = document.getElementsByTagName("xbee-cookie");
  let i = 0;

  if (xbeCookieTags.length > 0 && (XcooBee.kit.getConsentStatus() === "complete")) {
    for (i = 0; i < xbeCookieTags.length; i++) {
      let item = xbeCookieTags[i];
      let cookieValue = item.innerHTML;
      let itemOuter = item.outerHTML;

      try {
        // We use the array notation since it will throw error  when we have missing required attributes
        cookieValue = cookieValue.replace(/\r?\n|\r/g,""); // Remove CRLF
        let cookieName = item.attributes["name"].value;
        let cookieCategory = item.attributes["category"].value;
        let cookieDays = 0;

        // Days is optional so we use this notation to retrieve it
        if (item.attributes.getNamedItem("days") !== null) {
          cookieDays = parseInt(item.attributes("days"));
        }
        // Set or erase this cookie based on whether category is allowed
        if (cookieTypes[cookieCategory]) {
          // Set cookie
          xckSetCookie(cookieName,cookieValue,cookieDays);
        } else {
          // Erase cookie
          xckEraseCookie(cookieName);
        }
      } catch (error) {
        // Error happened
        console.log("error in cookie definition in tag:", itemOuter.substr(0,30));
        if (XcooBee.kit.getParam("testMode")) {
          console.log(error);
        }
      }
    }
  }
}

export default {
  xckClearCookies,
  xckHandleXbeeScriptTags,
  xckHandleXbeeCookieTags,
}
