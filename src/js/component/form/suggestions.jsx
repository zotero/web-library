import React, { forwardRef, useCallback, useState, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

const Suggestions = forwardRef(({ children, suggestions, onSelect }, ref) => {
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

	const handleKeyDown = useCallback(() => {
		switch (event.key) {
			case 'ArrowDown':
				setHighlighted(suggestions[getCurrentIndex(-1) + 1]);
			break;
			case 'ArrowUp':
				setHighlighted(suggestions[getCurrentIndex(suggestions.length) - 1]);
			break;
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
			isOpen={ true }
			toggle={ handleToggle }
		>
			<DropdownToggle
				tag="div"
				className="suggestions"
				onKeyDown={ handleKeyDown }
			>
			{ children }
			</DropdownToggle>
			<DropdownMenu
				flip={ false }
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
