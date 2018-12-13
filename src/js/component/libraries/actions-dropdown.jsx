'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Icon = require('../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const { isTriggerEvent } = require('../../common/event');

class ActionsDropdown extends React.PureComponent {
	state = {
		isOpen: false
	}

	handleDropwdownToggle(ev) {
		ev && ev.stopPropagation();
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleToggleInteraction(ev) {
		ev && ev.stopPropagation();
		if(ev.type === 'keydown' && ev.key === "Escape") {
			this.setState({ isOpen: false });
		}
	}

	handleMenuInteraction(ev) {
		if(isTriggerEvent(ev)) {
			ev && ev.stopPropagation();
			this.setState({ isOpen: false });
		}
	}

	render() {
		const { tabIndex } = this.props;
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ ev => this.handleDropwdownToggle(ev) }
				className="dropdown-wrapper"
			>
				<DropdownToggle
					onClick={ ev => this.handleToggleInteraction(ev) }
					onKeyDown={ ev => this.handleToggleInteraction(ev) }
					tabIndex={ tabIndex }
					color={ null }
					className="btn-icon dropdown-toggle"
				>
					<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
					<Icon type={ '16/options' } width="16" height="16" className="mouse" />
				</DropdownToggle>
				<DropdownMenu
					onClick={ ev => this.handleMenuInteraction(ev) }
					onKeyDown={ ev => this.handleMenuInteraction(ev) }
					right>
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
