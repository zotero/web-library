'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../../utils');
const Icon = require('../../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;

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
		let { columnNames } = this.props;
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
		columnNames: {},
		columns: [],
		itemFields: [],
		onColumnVisibilityChange: noop,
	}

	static propTypes = {
		columnNames: PropTypes.object,
		columns: PropTypes.array,
		itemFields: PropTypes.array,
		onColumnVisibilityChange: PropTypes.func
	}
}

module.exports = ColumnSelector;
