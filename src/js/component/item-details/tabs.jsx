import cx from 'classnames';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Spinner, Tab, Tabs } from 'web-common/components';

import Attachments from '../../component/item-details/attachments';
import EditToggleButton from '../edit-toggle-button';
import Info from '../../component/item-details/info';
import Notes from '../../component/item-details/notes';
import Panel from '../ui/panel';
import Related from '../../component/item-details/related';
import StandaloneAttachmentTabPane from '../../component/item-details/standalone-attachment';
import StandaloneNote from '../../component/item-details/standalone-note';
import Tags from '../../component/item-details/tags';
import { useEditMode, useFetchingState } from '../../hooks';
import { get, mapRelationsToItemKeys } from '../../utils';
import { fetchChildItems, fetchRelatedItems, } from '../../actions';

const pickDefaultActiveTab = (itemType, attachmentKey, noteKey) => {
	switch(itemType) {
		case 'note':
			return 'standalone-note';
		case 'attachment':
			return 'standalone-attachment';
		default:
			return attachmentKey ? 'attachments' : noteKey ? 'notes' : 'info';
	}
}

const PAGE_SIZE = 100;

const ItemDetailsTabs = () => {
	const id = useId();
	const dispatch = useDispatch();
	const isLibraryReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const noteKey = useSelector(state => state.current.noteKey);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const items = useSelector(state => get(state, ['libraries', libraryKey, 'items'], {}), shallowEqual);
	// collections are prefetched so if item is null, it's not a collection
	const isCollection = item?.[Symbol.for('type')] === 'collection';
	const childItemsState = useFetchingState(['libraries', libraryKey, 'itemsByParent', itemKey]);
	const relatedItemsState = useSelector(state => get(state, ['libraries', libraryKey, 'itemsRelated', itemKey], {}), shallowEqual);
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const shouldUseEditMode = useSelector(state => state.device.shouldUseEditMode);
	const shouldFetchChildItems = !isCollection && !['attachment', 'note'].includes(item.itemType);

	const { attachments, notes } = useMemo(() => {
		return (childItemsState.keys || []).reduce((acc, childItemKey) => {
			const item = items[childItemKey];
			if(item && item.itemType === 'attachment') {
				acc.attachments.push(item);
			}
			if(item && item.itemType === 'note') {
				acc.notes.push(item);
			}
			return acc;
		}, { attachments: [], notes: [] })
	}, [childItemsState.keys, items]);

	const relatedKeys = mapRelationsToItemKeys(item.relations || {}, libraryKey);

	const [isEditing, ] = useEditMode();
	const isReadOnly = isLibraryReadOnly || !!(shouldUseEditMode && !isEditing);

	const isReady = shouldUseTabs || (
		!shouldUseTabs && (!shouldFetchChildItems || (childItemsState.hasChecked && !childItemsState.hasMoreItems))
		&& relatedItemsState.isFetched
	);
	const [activeTab, setActiveTab] = useState(pickDefaultActiveTab(item.itemType, attachmentKey, noteKey));

	const shouldShowAttachmentsTab = shouldUseTabs || (!shouldUseTabs && (!isReadOnly || attachments.length > 0));
	const shouldShowNotesTab = shouldUseTabs || (!shouldUseTabs && (!isReadOnly || notes.length > 0));
	const shouldShowRelatedTab = shouldUseTabs || (!shouldUseTabs && (relatedKeys.length > 0));
	const shouldShowTagsTab = shouldUseTabs || (!shouldUseTabs && (!isReadOnly || !!item.tags?.length));

	useEffect(() => {
		// fetch child items on devices that don't use tabs, unless item type cannot have child items
		if (shouldUseTabs || !shouldFetchChildItems) {
			return;
		}

		if (itemKey && !childItemsState.isFetching && !childItemsState.isFetched) {
			const start = childItemsState.pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(itemKey, { start, limit }));
		}

	}, [childItemsState, shouldUseTabs, itemKey, shouldFetchChildItems, isCollection, dispatch]);

	useEffect(() => {
		// fetch related items on devices that don't use tabs
		if(shouldUseTabs) {
			return;
		}

		if(itemKey && !relatedItemsState.isFetching && !relatedItemsState.isFetched) {
			dispatch(fetchRelatedItems(itemKey));
		}
	}, [dispatch, itemKey, relatedItemsState, shouldUseTabs])

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown' && ev.target.closest('.tab')) {
			//move focus to tabPane itself (if focusable) or first focusable element within
			const nextTarget = ev.currentTarget.querySelector('.tab-pane.active[tabIndex="0"], .tab-pane.active [tabIndex="0"]');
			if(nextTarget) {
				ev.currentTarget.querySelector('.tab-pane.active[tabIndex="0"], .tab-pane.active [tabIndex="0"]').focus();
				ev.preventDefault();
			}
		}
		if(ev.key === 'Escape') {
			//@TODO: do this in a more elegant way
			document.querySelector('.items-table[tabIndex="0"]').focus();
		}
	}, []);

	const handleSelectTab = element => {
		setActiveTab(element.dataset.tabName);
	}

	useEffect(() => {
		const { itemType } = item;

		if(activeTab === 'standalone-note' && itemType !== 'note') {
			setActiveTab(pickDefaultActiveTab(item.itemType, attachmentKey, noteKey));
		}
		if(activeTab === 'standalone-attachment' && itemType !== 'attachment') {
			setActiveTab(pickDefaultActiveTab(item.itemType, attachmentKey, noteKey));
		}

		if(['info', 'notes', 'attachments'].includes(activeTab) &&
			['note', 'attachment'].includes(itemType)) {
			setActiveTab(pickDefaultActiveTab(item.itemType, attachmentKey, noteKey));
		}
	}, [activeTab, attachmentKey, item, noteKey]);


	return (
        <Panel
			// isBackdrop={ !shouldUseTabs && (!!noteKey || !!attachmentKey) } // we don't have slide-in view for attachments yet
			isBackdrop={ !shouldUseTabs && !!noteKey }
			className={ cx({ 'editing': isEditing })}
			bodyClassName={ cx({ 'loading': !isReady }) }
			onKeyDown={ handleKeyDown }
		>
			<header>
				<h4 className="offscreen">
					{ item.title }
				</h4>
				<Tabs
					compact
					activateOnFocus
					as-sections={ !shouldUseTabs }
					aria-label={ shouldUseTabs ? 'Item Details' : null }
				>
					{
						item.itemType === 'note' && (
							<Tab
								aria-controls={ `${id}-standalone-note` }
								data-tab-name="standalone-note"
								isActive={ activeTab === 'standalone-note' }
								onActivate={ handleSelectTab }
							>
								Note
							</Tab>
						)
					}
					{
						item.itemType === 'attachment' && (
							<Tab
								aria-controls={`${id}-standalone-attachment`}
								data-tab-name="standalone-attachment"
								isActive={ activeTab === 'standalone-attachment' }
								onActivate={ handleSelectTab }
							>
								Info
							</Tab>
						)
					}
					{
						!['attachment', 'note'].includes(item.itemType) && (
							<Fragment>
								<Tab
									aria-controls={`${id}-info`}
									data-tab-name="info"
									isActive={ activeTab === 'info' }
									onActivate={ handleSelectTab }
								>
									Info
								</Tab>
								{ shouldShowNotesTab && (
									<Tab
										aria-controls={`${id}-notes`}
										data-tab-name="notes"
										isActive={ activeTab === 'notes' }
										onActivate={ handleSelectTab }
										>
											Notes
									</Tab>
								) }
							</Fragment>
						)
					}

					{ shouldShowTagsTab && (
							<Tab
								aria-controls={`${id}-tags`}
								data-tab-name="tags"
								isActive={ activeTab === 'tags' }
								onActivate={ handleSelectTab }
						>
							Tags
						</Tab>
					) }
					{
						shouldShowAttachmentsTab && !['attachment', 'note'].includes(item.itemType) && (
							<Tab
								aria-controls={`${id}-attachments`}
								data-tab-name="attachments"
								isActive={ activeTab === 'attachments' }
								onActivate={ handleSelectTab }
							>
								Attachments
							</Tab>
						)
					}

					{ shouldShowRelatedTab && (
						<Tab
							aria-controls={`${id}-related`}
							data-tab-name="related"
							isActive={ activeTab === 'related' }
							onActivate={ handleSelectTab }
						>
							Related
						</Tab>
					) }
				</Tabs>
					{
						activeTab === 'info' && (
							<EditToggleButton
								isReadOnly={ isLibraryReadOnly }
								className="btn-link btn-edit"
							/>
						)
					}
			</header>
			{
				// on small devices, where tabs are not used, we display single spinner
				!isReady ? <Spinner className="large" /> : (
					<Fragment>
						{
							!['attachment', 'note'].includes(item.itemType) && (
								<Fragment>
									<Info
										key={ 'info-' + item.key }
										id={ `${id}-info` }
										isActive={ activeTab === 'info' }
										isReadOnly={ isReadOnly }
									/>
									{ shouldShowNotesTab && ( <Notes
										key={ 'notes-' + item.key }
										id={ `${id}-notes` }
										isActive={ activeTab === 'notes' }
										isReadOnly={ isReadOnly }
									/>
									) }
								</Fragment>
							)
						}

						{
							item.itemType === 'note' && (
								<StandaloneNote
									key={ 'standalone-note-' + item.key }
									id={`${id}-standalone-note` }
									isActive={ activeTab === 'standalone-note' }
									isReadOnly={ isReadOnly }
								/>
							)
						}
						{
							item.itemType === 'attachment' && (
								<StandaloneAttachmentTabPane
									key={ 'standalone-attachment-' + item.key }
									id={`${id}-standalone-attachment` }
									isActive={ activeTab === 'standalone-attachment' }
									isReadOnly={ isReadOnly }
								/>
							)
						}
						{ shouldShowTagsTab && (
							<Tags
								key={ 'tags-' + item.key }
								id={ `${id}-tags` }
								isActive={ activeTab === 'tags' }
								isReadOnly={ isReadOnly }
							/>
						) }
						{
							shouldShowAttachmentsTab && !['attachment', 'note'].includes(item.itemType) && (
								<Attachments
									key={ 'attachments-' + item.key }
									id={ `${id}-attachments` }
									isActive={ activeTab === 'attachments' }
									isReadOnly={ isReadOnly }
								/>
							)
						}
						{ shouldShowRelatedTab && (
							<Related
								key={ 'related-' + item.key }
								id={ `${id}-related` }
								isActive={ activeTab === 'related' }
							/>
						) }
					</Fragment>
				)
			}

		</Panel>
    );
};

ItemDetailsTabs.propTypes = {
	device: PropTypes.object,
};

export default ItemDetailsTabs;
