const cookieTypes = [
  { id: 0, key: 'application_cookie', title: 'necessary', amount: 1, model: 'application' },
  { id: 1, key: 'usage_cookie', title: 'user', amount: 1, model: 'usage' },
  { id: 2, key: 'statistics_cookie', title: 'statistics', amount: 2, model: 'statistics' },
  { id: 3, key: 'advertising_cookie', title: 'marketing', amount: 1, model: 'advertising' }
];
const locales = ['EN', 'DE', 'FR', 'ES'];
const tokenKey = 'xcoobeeAccessToken';
const xcoobeeCookiesKey = 'xcoobeeCookies';
const links = {
  poweredBy: 'https://www.xcoobee.com',
  login: 'http://localhost:3000/auth/minlogin',
  manage: 'https://testapp.xcoobee.net/user/consentCenter/consent'
};
const defaultConfig = {
  campaignId: null,
  position: 'left_bottom',
  termsUrl: 'https://lviv.com/terms',
  privacyUrl: 'https://lviv.com/policy',
  expirationTime: 120,
  companyLogoUrl: 'https://res-1.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_120,w_120,f_auto,b_white,q_auto:eco/v1506455567/rzmsg3oyifgkbl1ywrql.png'
};
const defaultMessage = 'This site uses cookies. Use this panel to adjust your preferences.';
const animations = {
  noAnimation: null,
  defaultOptions: 'blue',
  knownSite: 'green',
  crowdIntelligence: 'yellow'
};
const apiUrl = 'https://api.xcoobee.net';

export { cookieTypes, locales, tokenKey, links, xcoobeeCookiesKey, defaultConfig, defaultMessage, animations, apiUrl };