import PropTypes from "prop-types";

import { consentStatuses } from "../utils";

const ConsentStatusShape = PropTypes.oneOf(Object.values(consentStatuses));

export default ConsentStatusShape;
