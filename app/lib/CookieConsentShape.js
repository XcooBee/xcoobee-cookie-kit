import PropTypes from "prop-types";

const CookieConsentShape = PropTypes.shape({
  checked: PropTypes.bool.isRequired,
  type: PropTypes.oneOf([
    "advertising",
    "application",
    "statistics",
    "usage",
  ]).isRequired,
});

export default CookieConsentShape;
