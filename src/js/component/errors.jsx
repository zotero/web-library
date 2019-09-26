'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Button from './ui/button';
import Icon from './ui/icon';

const Message = ({ type, id, message, dismissError }) => (
	<li className={ cx('message', { [type]: true }) }>
		<header>
			{ type.charAt(0).toUpperCase() + type.slice(1) }
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
					<Message
						key={ error.id }
						dismissError={ dismissError }
						{ ...error }
					/>
				))
			}
		</ul>
	);
}

Message.propTypes = {
	dismissError: PropTypes.func,
	id: PropTypes.number,
	message :PropTypes.string,
	type: PropTypes.string,
}

Errors.propTypes = {
	dismissError: PropTypes.func,
	errors: PropTypes.array,
}

export default Errors;
