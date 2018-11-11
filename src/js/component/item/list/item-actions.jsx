'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../../utils');
const Icon = require('../../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;

class ItemActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	renderItemType(itemTypeDesc) {
		const { itemType, localized } = itemTypeDesc;
		return (
			<DropdownItem key={ itemType } onClick={ this.handleSelect.bind(this, itemType) }>
				{ localized }
			</DropdownItem>
		);
	}

	render() {
		const {
			itemsSource,
			selectedItemKeys,
			onPermanentlyDelete,
			onUndelete
		} = this.props;
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
					<Icon type={ '16/cog' } width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu>
					{ selectedItemKeys.length > 0 && itemsSource === 'trash' && (
						<React.Fragment>
							<DropdownItem onClick={ onUndelete }>
								Restore to Library
							</DropdownItem>
							<DropdownItem onClick={ onPermanentlyDelete }>
								Delete { selectedItemKeys.length > 1 ? 'Items' : 'Item' }
							</DropdownItem>
						</React.Fragment>
					)}
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		onUndelete: noop,
		onPermanentlyDelete: noop,
		selectedItemKeys: [],
	}

	static propTypes = {
		itemsSource: PropTypes.string,
		onUndelete: PropTypes.func,
		onPermanentlyDelete: PropTypes.func,
		selectedItemKeys: PropTypes.array,
	}
}

module.exports = ItemActions;
