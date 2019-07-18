'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Button from './ui/button';
import Icon from './ui/icon';

const Error = ({ id, message, dismissError }) => (
	<li className="error">
		<header>
			Error
		</header>
		{ message }
		<Button icon onClick={ () => dismissError(id) }>
			<Icon type={ '16/close' } width="16" height="16" />
		</Button>
	</li>
)

const Errors = ({ dismissError, errors }) => {
	return (
		<ul className="errors">
			{
				errors.filter(error => !error.isDismissed).map(error => (
					<Error
						key={ error.id }
						dismissError={ dismissError }
						{ ...error }
					/>
				))
			}
		</ul>
	);
}

Error.propTypes = {
	id: PropTypes.number,
	dismissError: PropTypes.func,
	message :PropTypes.string
}

Errors.propTypes = {
	dismissError: PropTypes.func,
	errors: PropTypes.array,
}

export default Errors;
