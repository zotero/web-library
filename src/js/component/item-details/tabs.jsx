'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector, shallowCompare } from 'react-redux';

import AttachmentsContainer from '../../container/item-details/attachments';
import EditToggleButton from '../edit-toggle-button';
import InfoContainer from '../../container/item-details/info';
import NotesContainer from '../../container/item-details/notes';
import Panel from '../ui/panel';
import RelatedContainer from '../../container/item-details/related';
import Spinner from '../ui/spinner';
import StandaloneAttachmentTabPane from '../../component/item-details/standalone-attachment';
import StandaloneNoteContainer from '../../container/item-details/standalone-note';
import TagsContainer from '../../container/item-details/tags';
import { Tab, Tabs } from '../ui/tabs';
import withDevice from '../../enhancers/with-device';
import { useEditMode, useFetchingState, useMetaState } from '../../hooks';
import { get, mapRelationsToItemKeys } from '../../utils';
import { fetchChildItems, fetchItemTypeCreatorTypes, fetchItemTypeFields, fetchRelatedItems,
	sourceFile } from '../../actions';

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

const ItemDetailsTabs = props => {
	const { device } = props;
	const dispatch = useDispatch();

	const isLibraryReadOnly = useSelector(state => state.current.isLibraryReadOnly);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const userId = useSelector(state => state.config.userId);
	const itemKey = useSelector(state => state.current.itemKey);
	const noteKey = useSelector(state => state.current.noteKey);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const items = useSelector(state => get(state, ['libraries', libraryKey, 'items'], {}), shallowCompare);
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));
	const childItemsState = useFetchingState(['libraries', libraryKey, 'itemsByParent', itemKey]);
	const relatedItemsState = useSelector(state => get(state, ['libraries', libraryKey, 'itemsRelated', itemKey], {}), shallowCompare);
	const { isMetaFetching, isMetaAvailable } = useMetaState();

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
	}, [childItemsState.keys, itemKey, items]);
	const relatedKeys = mapRelationsToItemKeys(item.relations || {}, userId);

	const [isEditing, ] = useEditMode();
	const isReadOnly = isLibraryReadOnly || !!(device.shouldUseEditMode && !isEditing);

	const isReady = device.shouldUseTabs || (
		!device.shouldUseTabs && childItemsState.hasChecked && relatedItemsState.isFetched &&
		isTinymceFetched && isMetaAvailable
	);
	const [activeTab, setActiveTab] = useState(pickDefaultActiveTab(item.itemType, attachmentKey, noteKey));

	const shouldShowAttachmentsTab = device.shouldUseTabs || (!device.shouldUseTabs && (!isReadOnly || attachments.length > 0));
	const shouldShowNotesTab = device.shouldUseTabs || (!device.shouldUseTabs && (!isReadOnly || notes.length > 0));
	const shouldShowRelatedTab = device.shouldUseTabs || (!device.shouldUseTabs && (relatedKeys.length > 0));
	const shouldShowTagsTab = device.shouldUseTabs || (!device.shouldUseTabs && (!isReadOnly || item.tags.length > 0));

	useEffect(() => {
		// fetch child items on devices that don't use tabs, unless item type cannot have child items
		if(device.shouldUseTabs || !item || ['attachment', 'note'].includes(item.itemType)) {
			return;
		}

		if(itemKey && !childItemsState.isFetching && !childItemsState.isFetched) {
			const start = childItemsState.pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(itemKey, { start, limit }));
		}
		if(itemKey && !relatedItemsState.isFetching && !relatedItemsState.isFetched) {
			dispatch(fetchRelatedItems(itemKey));
		}

	}, [childItemsState, relatedItemsState, device, itemKey]);

	useEffect(() => {
		// fetch meta on non-tab devices
		if(!device.shouldUseTabs && !isMetaAvailable && !isMetaFetching) {
			dispatch(fetchItemTypeCreatorTypes(item.itemType));
			dispatch(fetchItemTypeFields(item.itemType));
		}
	}, [isMetaFetching, isMetaAvailable, device]);

	useEffect(() => {
		// fetch tinymce on non-tab devices
		if(!device.shouldUseTabs && !isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, [device]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown' && ev.target.closest('.tab')) {
			ev.currentTarget.querySelector('.tab-pane.active [tabIndex]').focus();
			ev.preventDefault();
		}
		if(ev.key === 'Escape') {
			//@TODO: do this in a more elegant way
			document.querySelector('.items-table[tabIndex="0"]').focus();
		}
	});

	const handleSelectTab = ev => {
		setActiveTab(ev.currentTarget.dataset.tabName);
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
	}, [item]);


	return (
		<Panel
			className={ cx({ 'editing': isEditing })}
			bodyClassName={ cx({ 'loading': !isReady }) }
			onKeyDown={ handleKeyDown }
		>
			<header>
				<h4 className="offscreen">
					{ item.title }
				</h4>
				<Tabs compact>
					{
						item.itemType === 'note' && (
							<Tab
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
							<React.Fragment>
								<Tab
									data-tab-name="info"
									isActive={ activeTab === 'info' }
									onActivate={ handleSelectTab }
								>
									Info
								</Tab>
								{ shouldShowNotesTab && (
									<Tab
										data-tab-name="notes"
										isActive={ activeTab === 'notes' }
										onActivate={ handleSelectTab }
										>
											Notes
									</Tab>
								) }
							</React.Fragment>
						)
					}

					{ shouldShowTagsTab && (
							<Tab
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
								className="hidden-mouse-lg-up btn-link btn-edit"
							/>
						)
					}
			</header>
			{
				// on small devices, where tabs are not used, we display single spinner
				!isReady ? <Spinner className="large" /> : (
					<React.Fragment>
						{
							!['attachment', 'note'].includes(item.itemType) && (
								<React.Fragment>
									<InfoContainer
										key={ 'info-' + item.key }
										isActive={ activeTab === 'info' }
										isReadOnly={ isReadOnly }
									/>
									{ shouldShowNotesTab && ( <NotesContainer
										key={ 'notes-' + item.key }
										isActive={ activeTab === 'notes' }
										isReadOnly={ isReadOnly }
									/>
									) }
								</React.Fragment>
							)
						}

						{
							item.itemType === 'note' && (
								<StandaloneNoteContainer
									key={ 'standalone-note-' + item.key }
									isActive={ activeTab === 'standalone-note' }
								/>
							)
						}

						{
							item.itemType === 'attachment' && (
								<StandaloneAttachmentTabPane
									isActive={ activeTab === 'standalone-attachment' }
									isReadOnly={ isReadOnly }
								/>
							)
						}

						{ shouldShowTagsTab && (
								<TagsContainer
								key={ item.key }
								isActive={ activeTab === 'tags' }
								isReadOnly={ isReadOnly }
							/>
						) }
						{
							shouldShowAttachmentsTab && !['attachment', 'note'].includes(item.itemType) && (
								<AttachmentsContainer
									key={ 'attachments-' + item.key }
									isActive={ activeTab === 'attachments' }
									isReadOnly={ isReadOnly }
								/>
							)
						}
						{ shouldShowRelatedTab && (
							<RelatedContainer
								key={ 'related-' + item.key }
								isActive={ activeTab === 'related' }
							/>
						) }
					</React.Fragment>
				)
			}

		</Panel>
	)
};

ItemDetailsTabs.propTypes = {
	device: PropTypes.object,
};

export default withDevice(ItemDetailsTabs);
