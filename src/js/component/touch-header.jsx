import cx from 'classnames';
import PropTypes from 'prop-types';
import { Fragment, memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'web-common/components';

import CollectionActions from './touch-header/collection-actions';
import EditToggleButton from './edit-toggle-button';
import ItemsActions from './item/actions';
import Searchbar from './touch-header/searchbar';
import TouchNavigation from './touch-header/touch-navigation';
import { pluralize } from '../common/format';
import { Toolbar, ToolGroup } from './ui/toolbars';

const TouchHeader = props => {
	const { className, collectionKey, collectionHasChildren, isEditing, isModal, isSelectMode,
		onNavigate, onSelectModeToggle, path = [], shouldIncludeEditButton,
		shouldIncludeItemListOptions, shouldIncludeCollectionOptions, shouldHandleSelectMode,
		selectedItemsCount } = props;

	const isSingleColumn = useSelector(state => state.device.isSingleColumn);

	const shouldHideNav = (shouldIncludeEditButton && isEditing) ||
			(shouldHandleSelectMode && isSelectMode);

	const selectedLabel = selectedItemsCount === 0 ?
		'Select Items' : [
			selectedItemsCount,
			pluralize('Item', selectedItemsCount),
			'Selected'
		].join(' ');

	const handleCancelClick = useCallback(() => {
		onSelectModeToggle(false);
	}, [onSelectModeToggle]);

	return (
        <header className={ cx('touch-header', { 'select-mode': isSelectMode }, className) }>
			<Toolbar>
				{ isSingleColumn && !isModal && !isSelectMode && (
					<Searchbar />
				)}
				{
					!shouldHideNav && (
						<div className="toolbar-left">
							<TouchNavigation
								path={ path }
								onNavigate={ onNavigate }
							/>
						</div>
					)
				}
				{
					shouldIncludeCollectionOptions && (
						<div className="toolbar-right">
							<ToolGroup>
								<CollectionActions
									collectionKey={ collectionKey }
									collectionHasChildren={ collectionHasChildren }
								/>
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
					<Fragment>
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
								className="btn-link select-button"
								onClick={ handleCancelClick }
							>
								Cancel
							</Button>
						</div>
					</Fragment>
				)
			}
			</Toolbar>
		</header>
    );
}

TouchHeader.propTypes = {
	className: PropTypes.string,
	collectionHasChildren: PropTypes.bool,
	collectionKey: PropTypes.string,
	isEditing: PropTypes.bool,
	isModal: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	onNavigate: PropTypes.func,
	onSelectModeToggle: PropTypes.func,
	path: PropTypes.array,
	selectedItemsCount: PropTypes.number,
	shouldHandleSelectMode: PropTypes.bool,
	shouldIncludeCollectionOptions: PropTypes.bool,
	shouldIncludeEditButton: PropTypes.bool,
	shouldIncludeItemListOptions: PropTypes.bool,
};

export default memo(TouchHeader);
