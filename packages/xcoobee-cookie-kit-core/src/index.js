import AccessTokenManager from "./AccessTokenManager";
import configs from "./configs";
import cookieConsentsCache from "./cookieConsentsCache";
import CookieConsentsManager from "./CookieConsentsManager";
import graphql from "./graphql";
import NotAuthorizedError from "./NotAuthorizedError";
import renderText from "./renderText";

const core = {
  AccessTokenManager,
  configs,
  cookieConsentsCache,
  CookieConsentsManager,
  graphql,
  NotAuthorizedError,
  renderText,
};

export default core;
