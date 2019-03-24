'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils';
import Icon from '../../ui/icon';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import primaryItemTypes from '../../../constants/primary-item-types';

class NewItemSelector extends React.PureComponent {
	state = {
		isOpen: false,
		isSecondaryVisible: false
	}

	handleSelect(itemType) {
		this.props.onNewItemCreate(itemType);
	}

	handleToggleDropdown(ev) {
		if(this.props.disabled || (ev.target && ev.target.dataset.more)) {
			return;
		}

		this.setState({
			isOpen: !this.state.isOpen,
			isSecondaryVisible: false
		});
	}

	handleToggleMore(ev) {
		this.setState({ isSecondaryVisible: true });
		ev.preventDefault();
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
		const primaryItemTypesDesc = this.props.itemTypes.filter(
			it => primaryItemTypes.includes(it.itemType)
		);
		const secondaryItemTypesDesc = this.props.itemTypes.filter(
			it => !primaryItemTypes.includes(it.itemType)
		);
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper new-item-selector"
			>
			<DropdownToggle
				color={ null }
				disabled={ this.props.disabled }
				className="btn-icon dropdown-toggle"
				title="New Item"
			>
				<Icon type={ '16/plus' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu modifiers={{
				setMaxHeight: {
					enabled: true,
					order: 890,
					fn: (data) => {
						return {
							...data,
							styles: {
								...data.styles,
								overflow: 'auto',
								maxHeight: 300,
							},
						};
					},
				},
			}}
			>
			{ primaryItemTypesDesc.map(this.renderItemType.bind(this)) }
			<DropdownItem divider />
			{ this.state.isSecondaryVisible ?
				secondaryItemTypesDesc.map(this.renderItemType.bind(this)) :
				<DropdownItem data-more onClick={ this.handleToggleMore.bind(this) }>
					More
				</DropdownItem>
			}
			</DropdownMenu>
			</Dropdown>
			);
	}

	static defaultProps = {
		itemTypes: [],
		onNewItemCreate: noop,
	}

	static propTypes = {
		disabled: PropTypes.bool,
		itemTypes: PropTypes.array,
		onNewItemCreate: PropTypes.func,
	}
}

export default NewItemSelector;
