import PropTypes from "prop-types";

import { cookieTypes } from "../utils";

const CookieConsentShape = PropTypes.shape({
  checked: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(cookieTypes).isRequired,
});

export default CookieConsentShape;
