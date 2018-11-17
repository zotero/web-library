'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Icon = require('../../ui/icon');
const Button = require('../../ui/button');
const Spinner = require('../../ui/spinner');
const { Toolbar, ToolGroup } = require('../../ui/toolbars');
const ColumnSelector = require('./column-selector');
const NewItemSelector = require('./new-item-selector');
const ItemActions = require('./item-actions');
const { itemsSourceLabel } = require('../../../common/format');
const TouchHeaderContainer = require('../../../container/touch-header');
const ExportActions = require('./export-actions');

class ItemListToolbar extends React.PureComponent {
	state = { columns: [] }

	static getDerivedStateFromProps({ preferences: { columns } }) {
		return { columns };
	}

	render() {
		const {
			collection,
			isDeleting,
			itemsSource,
			onBibliographyOpen,
			onDelete,
			selectedItemKeys,
		} = this.props;


		// const touchHeaderLabel = itemsSource === 'collection' ?
		// 	collection ? collection.name : '' : itemsSourceLabel(itemsSource);

		return (
			<header className="hidden-sm-down">
				<TouchHeaderContainer
					className="hidden-mouse"
					variant={ TouchHeaderContainer.variants.SOURCE }
				/>
				<Toolbar className="hidden-touch hidden-sm-down">
					<div className="toolbar-left">
						<ToolGroup>
							<NewItemSelector
								disabled={ !['top', 'collection'].includes(itemsSource) }
								{ ...this.props }
							/>
							{
								itemsSource !== 'trash' && (
									<Button
										onClick={ onDelete }
										disabled={ isDeleting || selectedItemKeys.length === 0 }
									>
										{
											isDeleting ?
											<Spinner /> :
											<Icon type={ '16/trash' } width="16" height="16" />
										}
									</Button>
								)
							}
							<ItemActions { ...this.props } />
							<ExportActions { ...this.props } />
							<Button
								onClick={ onBibliographyOpen }
								disabled={ selectedItemKeys.length === 0 }
							>
								Bibliography
							</Button>
						</ToolGroup>
					</div>
					<div className="toolbar-right">
						<ColumnSelector { ...this.props } { ...this.state } />
					</div>
				</Toolbar>
			</header>
		);
	}
}

module.exports = ItemListToolbar;
