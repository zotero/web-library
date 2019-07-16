'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Button from './ui/button';
import Icon from './ui/icon';

const Error = ({ id, message, dismissError }) => (
	<div className="error">
		<div className="header">
			<Button icon onClick={ () => dismissError(id) }>
				<Icon type={ '16/close' } width="16" height="16" />
			</Button>
		</div>
		{ message }
	</div>
)

const Errors = ({ dismissError, errors }) => {
	return (
		<div className="errors">
			{
				errors.filter(error => !error.isDismissed).map(error => (
					<Error
						key={ error.errorId }
						dismissError={ dismissError }
						{ ...error }
					/>
				))
			}
		</div>
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
