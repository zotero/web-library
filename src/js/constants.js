'use strict';

import React from 'react';

export default {
	itemProp: React.PropTypes.shape({
		key: React.PropTypes.string,
		get: React.PropTypes.func,
		set: React.PropTypes.func
	})
};
