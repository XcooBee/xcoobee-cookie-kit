import PropTypes from "prop-types";

import { cookieTypes } from "xcoobee-cookie-kit-core/src/configs";

const CookieConsentShape = PropTypes.shape({
  checked: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(cookieTypes).isRequired,
});

export default CookieConsentShape;
