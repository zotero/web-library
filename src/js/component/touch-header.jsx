import cx from 'classnames';
import { Fragment, memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'web-common/components';

import CollectionActions from './touch-header/collection-actions';
import EditToggleButton from './edit-toggle-button';
import { ItemActionsTouch } from './item/actions';
import { MainSearchBar } from './touch-header/searchbar';
import TouchNavigation from './touch-header/touch-navigation';
import { pluralize } from '../common/format';
import CollectionTrashOptions from './touch-header/collection-trash-options';
import { Toolbar, ToolGroup } from './ui/toolbars';

const TouchHeader = props => {
	const { className, collectionKey, collectionHasChildren, isModal, isSelectMode, navigationName,
		onNavigate, onSelectModeToggle, path = [], shouldHideNav, shouldIncludeEditButton,
		shouldIncludeItemListOptions, shouldIncludeCollectionOptions, shouldHandleSelectMode,
		shouldIncludeCollectionTrashOptions, searchBar, selectedItemsCount } = props;

	const isSingleColumn = useSelector(state => state.device.isSingleColumn);

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
				{ ((isSingleColumn && !isModal && !isSelectMode) || searchBar) && (
					searchBar ? searchBar : <MainSearchBar />
				)}
				{
					!shouldHideNav && (
						<div className="toolbar-left">
							<TouchNavigation
								path={ path }
								onNavigate={ onNavigate }
								navigationName={ navigationName }
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
								<ItemActionsTouch />
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
				{shouldIncludeCollectionTrashOptions && (
					<CollectionTrashOptions
						isSingleColumn={ isSingleColumn }
						shouldHideNav={ shouldHideNav }
					/>
				)}
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

export default memo(TouchHeader);
