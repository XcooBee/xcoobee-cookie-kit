import PropTypes from "prop-types";

import { consentStatuses } from "xcoobee-cookie-kit-core/src/configs";

const ConsentStatusShape = PropTypes.oneOf(Object.values(consentStatuses));

export default ConsentStatusShape;
