import { Fragment, memo } from 'react';
import { useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { Toolbar, ToolGroup } from './ui/toolbars';
import { MoreActionsDropdownTouch } from './item/actions/more-actions';
import { useItemActionHandlers } from '../hooks';

const TouchFooter = () => {
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const selectedItemsCount = useSelector(state => state.current.itemKeys.length);
	const isTrash = useSelector(state => state.current.isTrash);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const { handleAddToCollectionModalOpen, handleCiteModalOpen, handleRemoveFromCollection,
		handleTrash, handlePermanentlyDelete, handleUndelete, handleBibliographyModalOpen,
		handleExportModalOpen } = useItemActionHandlers();

	return (
		<footer className="touch-footer">
			<Toolbar>
				<div className="toolbar-justified">
					<ToolGroup>
						{!isReadOnly && (
							<Fragment>
								{
									!isTrash && (
										<Button icon onClick={handleAddToCollectionModalOpen} disabled={selectedItemsCount === 0}>
											<Icon type={'32/add-to-collection'} width="32" height="32" />
										</Button>
									)}
								{
									(itemsSource === 'collection' || (itemsSource === 'query' && collectionKey)) && (
										<Button icon onClick={handleRemoveFromCollection} disabled={selectedItemsCount === 0}>
											<Icon type={'32/remove-from-collection'} width="32" height="32" />
										</Button>
									)}
								{
									!isTrash && (
										<Button icon onClick={handleTrash} disabled={selectedItemsCount === 0} >
											<Icon type={'24/trash'} width="24" height="24" />
										</Button>
									)}
								{
									isTrash && (
										<Button icon onClick={handleUndelete} disabled={selectedItemsCount === 0} >
											<Icon type={'24/restore'} width="24" height="24" />
										</Button>
									)}
								{
									isTrash && (
										<Button icon onClick={handlePermanentlyDelete} disabled={selectedItemsCount === 0} >
											<Icon type={'24/empty-trash'} width="24" height="24" />
										</Button>
									)}
							</Fragment>
						)}
						<Button icon onClick={handleExportModalOpen} disabled={selectedItemsCount === 0 || selectedItemsCount > 100}>
							<Icon type={'24/export'} width="24" height="24" />
						</Button>
						<Button icon onClick={handleCiteModalOpen} disabled={selectedItemsCount === 0}>
							<Icon type={'24/cite'} width="24" height="24" />
						</Button>
						<Button icon onClick={handleBibliographyModalOpen} disabled={selectedItemsCount === 0}>
							<Icon type={'24/bibliography'} width="24" height="24" />
						</Button>
						<MoreActionsDropdownTouch />
					</ToolGroup>
				</div>
			</Toolbar>
		</footer>
	);
}

export default memo(TouchFooter);
