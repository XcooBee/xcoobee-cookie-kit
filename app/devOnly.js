/* eslint-disable no-console */
import "./index";

window.theCookieHandler = (cookieConsents) => {
  console.log("window.theCookieHandler:");
  console.dir(cookieConsents);
};

XcooBee.kit.setParam("campaignReference", "abcdefgh1234567890");

XcooBee.kit.setParam("checkByDefaultTypes", [
  "application",
  "statistics",
]);

XcooBee.kit.setParam("companyLogo", "http://lorempixel.com/output/city-q-c-300-100-4.jpg");

XcooBee.kit.setParam("cookieHandler", "theCookieHandler");
// XcooBee.kit.setParam("cookieHandler", (cookieConsents) => {
//   console.log("cookieHandler:");
//   console.dir(cookieConsents);
// });

XcooBee.kit.setParam("cssAutoLoad", true);

XcooBee.kit.setParam("displayOnlyForEU", true);

XcooBee.kit.setParam("expirationTime", 0);

XcooBee.kit.setParam("hideOnComplete", true);

XcooBee.kit.setParam("position", "left_bottom");
// XcooBee.kit.setParam("position", "left_top");
// XcooBee.kit.setParam("position", "right_bottom");
// XcooBee.kit.setParam("position", "right_top");

XcooBee.kit.setParam("privacyUrl", "https://xcoobee.com/privacy");

XcooBee.kit.setParam("requestDataTypes", [
  "application",
  "advertising",
  "statistics",
  // "usage",
]);

XcooBee.kit.setParam("termsUrl", "https://xcoobee.com/terms");

XcooBee.kit.setParam("testMode", true);

XcooBee.kit.setParam("textMessage", {
  "de-de": "Die Beschreibung.",
  "en-us": "The description.",
  "es-419": "La descripción.",
  "fr-fr": "La description.",
});

// const config = {
//   campaignReference: "abcdefgh1234567890",
//   checkByDefaultTypes: [
//     "application",
//     "statistics",
//   ],
//   companyLogo: "http://lorempixel.com/output/city-q-c-300-100-4.jpg",
//   cookieHandler: (cookieConsents) => {
//     console.log("cookieHandler:");
//     console.dir(cookieConsents);
//   },
//   cssAutoLoad: true,
//   displayOnlyForEU: true,
//   // expirationTime: 10,
//   hideOnComplete: true,
//   position: "left_bottom",
//   // position: "left_top",
//   // position: "right_bottom",
//   // position: "right_top",
//   privacyUrl: "https://xcoobee.com/privacy",
//   requestDataTypes: [
//     "application",
//     "advertising",
//     "statistics",
//     // "usage",
//   ],
//   termsUrl: "https://xcoobee.com/terms",
//   testMode: true,
//   textMessage: {
//     "de-de": "Die Beschreibung.",
//     "en-us": "The description.",
//     "es-419": "La descripción.",
//     "fr-fr": "La description.",
//   },
// };
// XcooBee.kit.initialize(config);

XcooBee.kit.render();
