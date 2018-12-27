import AccessTokenManager from './AccessTokenManager';
import config from './config';
import cookieConsentsCache from './cookieConsentsCache';
import CookieConsentsManager from './CookieConsentsManager';
import graphql from './graphql';
import NotAuthorizedError from './NotAuthorizedError';
import renderText from './renderText';

const core = {
  AccessTokenManager,
  config,
  cookieConsentsCache,
  CookieConsentsManager,
  graphql,
  NotAuthorizedError,
  renderText,
};

export default core;
