import PropTypes from "prop-types";

import { positions } from "../utils";

// Note: One of `cookieHandler` or `targetUrl` is required.
const ConfigShape = PropTypes.shape({
  campaignReference: PropTypes.string,
  checkByDefaultTypes: PropTypes.arrayOf(
    PropTypes.oneOf([
      "advertising",
      "application",
      "statistics",
      "usage",
    ]).isRequired,
  ),
  companyLogo: PropTypes.string,
  cookieHandler: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
  displayOnlyForEU: PropTypes.bool,
  expirationTime: PropTypes.number,
  hideOnComplete: PropTypes.bool,
  position: PropTypes.oneOf(positions),
  targetUrl: PropTypes.string,
  testMode: PropTypes.bool,
});

export default ConfigShape;
