'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Icon = require('../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;

class ActionsDropdown extends React.PureComponent {
	state = {
		isOpen: false
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper"
			>
				<DropdownToggle
					color={ null }
					className="btn-icon dropdown-toggle"
				>
					<Icon type={ '16/options' } width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu right>
					{ this.props.children }
				</DropdownMenu>
			</Dropdown>
		);
	}

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		columnNames: PropTypes.object,
	}
}

module.exports = ActionsDropdown;
