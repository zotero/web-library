import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { dismissError } from '../actions';

const Message = ({ type, id, message, cta }) => {
	const dispatch = useDispatch();
	const handleClick = useCallback(() => dispatch(dismissError(id)), [dispatch, id]);

	return (
		<li className={ cx('message', { [type]: true }) }>
			<header>
				{ type.charAt(0).toUpperCase() + type.slice(1) }
			</header>
			{ message }

			{ cta && (
				<React.Fragment>
				&nbsp;<a href={ cta.href }>{ cta.label }</a>
				</React.Fragment>
			)}
			<Button icon onClick={ handleClick }>
				<Icon type={ '16/close' } width="16" height="16" />
			</Button>
		</li>
	)
}

const Messages = () => {
	const errors = useSelector(state => state.errors);
	return (
		<ul className="messages">
			{
				errors.filter(error => !error.isDismissed).map(error => (
					<Message
						key={ error.id }
						{ ...error }
					/>
				))
			}
		</ul>
	);
}

Message.propTypes = {
	cta: PropTypes.object,
	id: PropTypes.number,
	message :PropTypes.string,
	type: PropTypes.string,
}

Messages.propTypes = {
	errors: PropTypes.array,
}

export default Messages;
