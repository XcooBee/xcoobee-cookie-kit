/* eslint-disable no-console */
import "./index";

window.theCookieHandler = (cookieConsents) => {
  console.log("window.theCookieHandler:");
  console.dir(cookieConsents);
};

XcooBee.kit.setParam("campaignReference", "abcdefgh1234567890");
XcooBee.kit.setParam("companyLogo", "http://lorempixel.com/output/city-q-c-300-100-4.jpg");
XcooBee.kit.setParam("checkByDefaultTypes", [
  "application",
  "statistics",
]);
XcooBee.kit.setParam("cookieHandler", "theCookieHandler");
XcooBee.kit.setParam("cssAutoLoad", true);
XcooBee.kit.setParam("displayOnlyForEU", true);
XcooBee.kit.setParam("expirationTime", 10);
XcooBee.kit.setParam("hideOnComplete", true);
// XcooBee.kit.setParam("position", "right_bottom");
XcooBee.kit.setParam("position", "left_bottom");
// XcooBee.kit.setParam("position", "right_top");
// XcooBee.kit.setParam("position", "left_top");
XcooBee.kit.setParam("privacyUrl", "https://xcoobee.com/privacy");
XcooBee.kit.setParam("requestDataTypes", [
  "application",
  "advertising",
  "statistics",
]);
XcooBee.kit.setParam("textMessage", {
  "en-us": "The description.",
  "es-419": "El descripto.",
});
XcooBee.kit.setParam("termsUrl", "https://xcoobee.com/terms");
XcooBee.kit.setParam("testMode", true);

// const config = {
//   checkByDefaultTypes: [
//     "application",
//     "statistics",
//   ],
//   cookieHandler: (cookieConsents) => {
//     console.log("cookieHandler:");
//     console.dir(cookieConsents);
//   },
//   cssAutoLoad: true,
//   displayOnlyForEU: true,
//   // expirationTime: 8,
//   privacyUrl: "https://xcoobee.com/privacy",
//   requestDataTypes: [
//     "application",
//     "advertising",
//     "statistics",
//   ],
//   termsUrl: "https://xcoobee.com/terms",
//   testMode: true,
// };
// XcooBee.kit.initialize(config);

XcooBee.kit.render();
