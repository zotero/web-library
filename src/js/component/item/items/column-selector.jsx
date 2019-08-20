'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils';
import Icon from '../../ui/icon';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import columnNames from '../../../constants/column-names';

class ColumnSelector extends React.PureComponent {
	state = {
		isOpen: false
	}

	handleSelect = field => {
		const { columns, onColumnVisibilityChange } = this.props;
		onColumnVisibilityChange(field, !columns.find(c => c.field === field).isVisible);
	}

	handleToggleDropdown = () => {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}

	renderColumnItem = column => {
		return (
			<DropdownItem
				key={ column.field }
				onClick={ () => this.handleSelect(column.field) }>
				<span className="tick">{ column.isVisible ? "✓" : "" }</span>
				{ column.field in columnNames ? columnNames[column.field] : column.field }
			</DropdownItem>
		);
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown }
				className="column-selector"
			>
				<DropdownToggle
					className="btn-icon dropdown-toggle"
					color={ null }
					onKeyDown={ this.handleKeyDown }
					tabIndex={ this.props.tabIndex }
				>
					<Icon type={ '16/columns' } width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu right>
					{ this.props.columns
						.filter(c => c.field !== 'title')
						.map(this.renderColumnItem)
					}
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		columns: [],
		itemFields: [],
		onColumnVisibilityChange: noop,
		onFocusNext: noop,
		onFocusPrev: noop,
	}

	static propTypes = {
		columns: PropTypes.array,
		itemFields: PropTypes.array,
		onColumnVisibilityChange: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		tabIndex: PropTypes.number,
	}
}

export default ColumnSelector;
