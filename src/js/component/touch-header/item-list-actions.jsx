'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../utils');
const Icon = require('../../component/ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;

class CollectionActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleSelectModeToggle() {
		const { isSelectMode, onSelectModeToggle } = this.props;
		onSelectModeToggle(!isSelectMode);
	}

	render() {
		const { isSelectMode } = this.props;
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper new-item-selector"
			>
				<DropdownToggle
					color={ null }
					className="btn-icon dropdown-toggle"
				>
					<Icon type="24/options" width="24" height="24" />
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem onClick={ this.handleSelectModeToggle.bind(this) }>
						{ isSelectMode ? 'Cancel' : 'Select Items' }
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		onSelectModeToggle: noop,
	}

	static propTypes = {
		isSelectMode: PropTypes.bool,
		onSelectModeToggle: PropTypes.func,
	}
}

module.exports = CollectionActions;
