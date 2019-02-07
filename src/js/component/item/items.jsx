'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const ItemsTableToolbar = require('./items/toolbar');
const ItemsTable = require('./items/table');
const ItemsList = require('./items/list');
const TouchHeaderContainer = require('../../container/touch-header');
const { Toolbar } = require('../ui/toolbars');
const Button = require('../ui/button');
const Icon = require('../ui/icon');

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
					<footer className="touch-footer">
						<Toolbar>
							<div className="toolbar-justified">
								<div className="tool-group">
									<Button>
										<Icon type={ '32/add-to-collection' } width="32" height="32" />
									</Button>
								</div>
							</div>
						</Toolbar>
					</footer>
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
