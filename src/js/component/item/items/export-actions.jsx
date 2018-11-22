'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../../utils');
const Icon = require('../../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;
const exportFormats = require('../../../constants/export-formats');

class ExportActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleSelect(format) {
		this.props.onExport(format);
	}

	renderItemType(exportFormat) {
		return (
			<DropdownItem
				key={ exportFormat.key }
				onClick={ this.handleSelect.bind(this, exportFormat.key) }
			>
				{ exportFormat.label }
			</DropdownItem>
		);
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper new-item-selector"
			>
				<DropdownToggle
					color={ null }
					disabled={ this.props.selectedItemKeys.length == 0 }
					className="btn-icon dropdown-toggle"
				>
					Export
				</DropdownToggle>
				<DropdownMenu>
					{
						exportFormats.map(exportFormat => this.renderItemType(exportFormat))
					}
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		onExport: noop,
	}

	static propTypes = {
		onExport: PropTypes.func,
		selectedItemKeys: PropTypes.array,
	}
}

module.exports = ExportActions;
