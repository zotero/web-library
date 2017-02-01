'use strict';

import React from 'react';

export default {
	itemProp: React.PropTypes.shape({
		data: React.PropTypes.shape({
			title: React.PropTypes.string,
			author: React.PropTypes.string,
			year: React.PropTypes.number,
			date: React.PropTypes.string
		})
	}),
	fieldTypes: {
			EDITABLE: 'EDITABLE',
			READONLY: 'READONLY',
			CREATORS: 'CREATORS'
	}
};
