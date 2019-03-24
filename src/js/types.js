'use strict';

import PropTypes from 'prop-types';

const collection = PropTypes.shape({
	key: PropTypes.string.isRequired,
	parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	name: PropTypes.string,
});

const item = PropTypes.shape({
	key: PropTypes.string.isRequired
});

export default {
	item, collection
};
