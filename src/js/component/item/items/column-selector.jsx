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
				className="dropdown-wrapper column-selector"
			>
				<DropdownToggle
					color={ null }
					className="btn-icon dropdown-toggle"
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
	}

	static propTypes = {
		columns: PropTypes.array,
		itemFields: PropTypes.array,
		onColumnVisibilityChange: PropTypes.func
	}
}

export default ColumnSelector;
