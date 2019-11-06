import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useState, useImperativeHandle } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import { omit } from '../../common/immutable';

// workaround for DropdownToggle not allowing childless element
// https://github.com/reactstrap/reactstrap/blob/dc0b8ae45136e4aecb055c929b0b6424c4d9a771/src/DropdownToggle.js#L63
const DropChildren = ({ innerRef, ...props }) => (
	<input ref={ innerRef } { ...omit(props, ['children'])} />
);

DropChildren.displayName = 'DropChildren';

DropChildren.propTypes = {
	innerRef: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.shape({ current: PropTypes.instanceOf(Element) })
	])
};

const Suggestions = forwardRef((props, ref) => {
	const { children, inputProps, suggestions, onSelect } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(null);

	useImperativeHandle(ref, () => ({
		getSuggestion: () => highlighted
	}));

	const handleToggle = useCallback(() => {
		setIsOpen(!isOpen);
	});

	const getCurrentIndex = indexIfNotFound => {
		const currentIndex = suggestions.findIndex(s => s === highlighted);
		return currentIndex === -1 ? indexIfNotFound : currentIndex;
	}

	const handleKeyDown = useCallback(event => {
		switch (event.key) {
			case 'ArrowDown':
				setHighlighted(suggestions[getCurrentIndex(-1) + 1]);
			break;
			case 'ArrowUp':
				setHighlighted(suggestions[getCurrentIndex(suggestions.length) - 1]);
			break;
		}
		if(inputProps.onKeyDown) {
			inputProps.onKeyDown(event);
		}
	});

	const handleClick = useCallback(ev => {
		ev.stopPropagation();
		ev.preventDefault();
		onSelect(ev.currentTarget.dataset.suggestion, ev);
	});

	return (
		<Dropdown
			direction="down"
			isOpen={ suggestions.length > 0 }
			toggle={ handleToggle }
		>
			<DropdownToggle
				tag={ DropChildren }
				{ ...inputProps }
				className={ cx('suggestions', inputProps.className) }
				onKeyDown={ handleKeyDown }
			>
			</DropdownToggle>
			<DropdownMenu
				modifiers={{
					preventOverflow: { enabled: false }
				}}
			>
				{ suggestions.map(s =>
					<DropdownItem
						active={ s === highlighted }
						data-suggestion={ s }
						key={ s }
						onClick={ handleClick }
						tag="div"
					>
						{ s }
					</DropdownItem>
				)}
			</DropdownMenu>
		</Dropdown>
	);
});

Suggestions.propTypes = {
	suggestions: PropTypes.array,
	children: PropTypes.element,
	onSelect: PropTypes.func.isRequired,
}

Suggestions.defaultProps = {
	suggestions: [],
}

Suggestions.displayName = "Suggestions";

export default Suggestions;
