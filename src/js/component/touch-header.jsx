'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import Button from './ui/button';
import CollectionActions from './touch-header/collection-actions';
import EditToggleButton from './edit-toggle-button';
import ItemsActions from './item/actions';
import Searchbar from './touch-header/searchbar';
import TouchNavigation from './touch-header/touch-navigation';
import { pick } from '../common/immutable';
import { pluralize } from '../common/format';
import { Toolbar, ToolGroup } from './ui/toolbars';

class TouchHeader extends React.PureComponent {
	handleCancelClick = () => {
		this.props.onSelectModeToggle(false);
	}

	render() {
		const { device, isEditing, isModal, path, className, navigate, shouldIncludeEditButton,
			shouldIncludeItemListOptions, shouldIncludeCollectionOptions, shouldHandleSelectMode,
			isSelectMode, selectedItemsCount } = this.props;

		const shouldHideNav = (shouldIncludeEditButton && isEditing) ||
			(shouldHandleSelectMode && isSelectMode);

		const selectedLabel = selectedItemsCount === 0 ?
			'Select Items' : [
				selectedItemsCount,
				pluralize('Item', selectedItemsCount),
				'Selected'
			].join(' ');

		return (
			<header className={ cx('touch-header', className) }>
				<Toolbar>
					{ device.isSingleColumn && !isModal && (
						<Searchbar />
					)}
					{
						!shouldHideNav && (
							<div className="toolbar-left">
								<TouchNavigation
									path={ path }
									navigate={ navigate }
								/>
							</div>
						)
					}
					{
						shouldIncludeCollectionOptions && (
							<div className="toolbar-right">
								<ToolGroup>
									<CollectionActions { ...this.props } />
								</ToolGroup>
							</div>
						)
					}
					{
						shouldIncludeItemListOptions && (
							<div className="toolbar-right">
								<ToolGroup>
									<ItemsActions />
								</ToolGroup>
							</div>
						)
					}
					{
						shouldIncludeEditButton && (
							<div className="toolbar-right">
								<ToolGroup>
									<EditToggleButton className="btn-link" />
								</ToolGroup>
							</div>
						)
					}
				{
					shouldHandleSelectMode && isSelectMode && (
						<React.Fragment>
							<div className="toolbar-left" />
							<div className="toolbar-center">
								<ToolGroup>
									<h3 className="toolbar-heading">
										{ selectedLabel }
									</h3>
								</ToolGroup>
							</div>
							<div className="toolbar-right">
								<Button
									className="btn-link"
									onClick={ this.handleCancelClick }
								>
									Cancel
								</Button>
							</div>
						</React.Fragment>
					)
				}
				</Toolbar>
			</header>
		)
	}
}

TouchHeader.propTypes = {
	className: PropTypes.string,
	isEditing: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	navigate: PropTypes.func,
	onEditModeToggle: PropTypes.func,
	onSelectModeToggle: PropTypes.func,
	path: PropTypes.array,
	selectedItemsCount: PropTypes.number,
	shouldHandleSelectMode: PropTypes.bool,
	shouldIncludeCollectionOptions: PropTypes.bool,
	shouldIncludeEditButton: PropTypes.bool,
	shouldIncludeItemListOptions: PropTypes.bool,
	view: PropTypes.string,
};

TouchHeader.defaultProps = {
	path: []
};

export default TouchHeader;
