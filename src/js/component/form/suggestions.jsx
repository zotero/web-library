import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, forwardRef, useCallback, useState, useImperativeHandle } from 'react';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';

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
	const { inputProps, suggestions, onSelect } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(null);

	useImperativeHandle(ref, () => ({
		getSuggestion: () => highlighted
	}));

	const handleToggle = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const getNextIndex = useCallback(direction => {
		const currentIndex = suggestions.findIndex(s => s === highlighted);
		if(currentIndex === -1) {
			return 0;
		}
		let nextIndex = currentIndex + direction;
		if(nextIndex > suggestions.length - 1) {
			nextIndex = 0;
		} else if(nextIndex === -1) {
			nextIndex = suggestions.length - 1;
		}
		return nextIndex;
	}, [highlighted, suggestions]);

	const handleKeyDown = useCallback(event => {
		if(suggestions.length > 0) {
			switch (event.key) {
				case 'ArrowDown':
					setHighlighted(suggestions[getNextIndex(1)]);
				break;
				case 'ArrowUp':
					setHighlighted(suggestions[getNextIndex(-1)]);
				break;
			}
		}
		if(inputProps.onKeyDown) {
			inputProps.onKeyDown(event);
		}
	}, [getNextIndex, inputProps, suggestions]);

	const handleClick = useCallback(ev => {
		ev.stopPropagation();
		ev.preventDefault();
		onSelect(ev.currentTarget.dataset.suggestion, ev);
	}, [onSelect]);

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
	children: PropTypes.element,
	inputProps: PropTypes.object,
	onSelect: PropTypes.func.isRequired,
	suggestions: PropTypes.array,
}

Suggestions.defaultProps = {
	suggestions: [],
}

Suggestions.displayName = "Suggestions";

export default memo(Suggestions);
