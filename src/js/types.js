'use strict';

const PropTypes = require('prop-types');

const collection = PropTypes.shape({
	key: PropTypes.string.isRequired,
	parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	name: PropTypes.string,
});

const item = PropTypes.shape({
	key: PropTypes.string.isRequired
});

module.exports = {
	item, collection
}
