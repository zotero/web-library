import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import columnNames from '../../../constants/column-names';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import Icon from '../../ui/icon';
import { applyChangesToVisibleColumns, resizeVisibleColumns2 } from '../../../utils';
import { preferenceChange } from '../../../actions';

const ColumnSelector = props => {
	const { tabIndex } = props;
	const { onFocusNext, onFocusPrev } = props;
	const [isOpen, setIsOpen] = useState(false);
	const dispatch = useDispatch();
	const columns = useSelector(state => state.preferences.columns, shallowEqual);

	const handleSelect = useCallback(ev => {
		const { field } = ev.currentTarget.dataset;

		const newColumns = columns.map(c => ({ ...c }));
		const columnIndex = newColumns.findIndex(c => c.field === field);
		const shouldBeVisible = !newColumns[columnIndex].isVisible;
		newColumns[columnIndex].isVisible = shouldBeVisible;

		if(columnIndex === -1) {
			return;
		}

		const fractionBias = newColumns[columnIndex].isVisible ?
			newColumns[columnIndex].fraction * -1 :
			newColumns[columnIndex].fraction;

		const visibleColumns = newColumns.filter(c => c.isVisible);
		resizeVisibleColumns2(visibleColumns, fractionBias);
		return dispatch(preferenceChange('columns', applyChangesToVisibleColumns(visibleColumns, newColumns)));
	});

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	});

	return (
		<Dropdown
			isOpen={ isOpen }
			toggle={ handleToggleDropdown }
			className="column-selector"
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				color={ null }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
			>
				<Icon type={ '16/columns' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu right>
				{ columns
					.filter(c => c.field !== 'title')
					.map(column => (
						<DropdownItem
							data-field={ column.field }
							key={ column.field }
							onClick={ handleSelect }
						>
							<span className="tick">{ column.isVisible ? "✓" : "" }</span>
							{ column.field in columnNames ? columnNames[column.field] : column.field }
						</DropdownItem>
					))
				}
			</DropdownMenu>
		</Dropdown>
	);
}

ColumnSelector.propTypes = {
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	tabIndex: PropTypes.number,
}

export default ColumnSelector;
