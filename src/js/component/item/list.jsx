'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const ItemListToolbar = require('./list/toolbar');
const Items = require('./list/items');

class ItemList extends React.PureComponent {
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
				attachments: 'Attachments',
				notes: 'Notes',
				year: 'Year',
				publication: 'Publication'
			}
		}
	}

	render() {
		return (
			<div className="items-container">
				<ItemListToolbar { ...this.props } { ...this.state } />
				<Items { ...this.props } { ...this.state } />
			</div>
		);
	}
}

module.exports = ItemList;
