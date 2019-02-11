'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const ItemsTableToolbar = require('./items/toolbar');
const ItemsTable = require('./items/table');
const ItemsList = require('./items/list');
const TouchHeaderContainer = require('../../container/touch-header');
const TouchFooter = require('../touch-footer');

class Items extends React.PureComponent {
	state = {};
	static getDerivedStateFromProps({ itemFields = [] }) {
		return {
			columnNames: {
				...itemFields.reduce((acc, itemField) => {
					acc[itemField.field] = itemField.localized;
					return acc;
				}, {}),
				creator: 'Creator',
				dateAdded: 'Date Added',
				dateModified: 'Date Modified',
				itemType: 'Item Type',
				year: 'Year',
				publication: 'Publication'
			}
		}
	}

	render() {
		const { device } = this.props;
		if(device.isTouchOrSmall) {
			return (
				<div className="items-container">
					<TouchHeaderContainer
						className="hidden-mouse hidden-sm-down"
						variant={ TouchHeaderContainer.variants.SOURCE }
					/>
					<ItemsList { ...this.props } { ...this.state } />
					<TouchFooter />
				</div>
			);
		} else {
			return (
				<div className="items-container">
					<ItemsTableToolbar { ...this.props } { ...this.state } />
					<ItemsTable { ...this.props } { ...this.state } />
				</div>
			);
		}
	}
}

module.exports = Items;
