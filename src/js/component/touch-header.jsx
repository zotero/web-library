'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import TouchNavigation from './touch-navigation';
import EditToggleButton from './edit-toggle-button';
import CollectionActions from './touch-header/collection-actions';
import ItemsActionsContainer from '../container/items-actions';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Button from './ui/button';
import { pluralize } from '../common/format';

class TouchHeader extends React.PureComponent {
	handleCancelClick = () => {
		this.props.onSelectModeToggle(false);
	}

	render() {
		const { isEditing, path, className, onNavigation,
			shouldIncludeEditButton, shouldIncludeItemListOptions,
			shouldIncludeCollectionOptions, shouldHandleSelectMode,
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
					{
						!shouldHideNav && (
							<div className="toolbar-left">
								<TouchNavigation
									path={ path }
									onNavigation={ onNavigation }
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
									<ItemsActionsContainer />
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
	onEditModeToggle: PropTypes.func,
	onNavigation: PropTypes.func,
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
