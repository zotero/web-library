'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AttachmentsContainer from '../../container/item-details/attachments';
import EditToggleButton from '../edit-toggle-button';
import InfoContainer from '../../container/item-details/info';
import NotesContainer from '../../container/item-details/notes';
import Panel from '../ui/panel';
import RelatedContainer from '../../container/item-details/related';
import Spinner from '../ui/spinner';
import StandaloneAttachmentContainer from '../../container/item-details/standalone-attachment';
import StandaloneNoteContainer from '../../container/item-details/standalone-note';
import TagsContainer from '../../container/item-details/tags';
import { Tab, Tabs } from '../ui/tabs';
import withDevice from '../../enhancers/with-device';
import { useEditMode, useFetchingState, useMetaState } from '../../hooks';
import { get } from '../../utils';
import { fetchChildItems } from '../../actions';

const pickDefaultActiveTab = (itemType, noteKey) => {
	switch(itemType) {
		case 'note':
			return 'standalone-note';
		case 'attachment':
			return 'standalone-attachment';
		default:
			return noteKey ? 'notes' : 'info';
	}
}

const PAGE_SIZE = 100;

const ItemDetailsTabs = props => {
	const { device } = props;
	const dispatch = useDispatch();

	const isLibraryReadOnly = useSelector(state => state.current.isLibraryReadOnly);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const noteKey = useSelector(state => state.current.noteKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const childItemsState = useFetchingState(['libraries', libraryKey, 'itemsByParent', itemKey]);
	const relatedItemsState = useFetchingState(['libraries', libraryKey, 'itemsRelated', itemKey]);
	const { isMetaFetching } = useMetaState();

	const [isEditing, ] = useEditMode();
	const isReadOnly = isLibraryReadOnly || !!(device.shouldUseEditMode && !isEditing);
	const isLoading = childItemsState.isFetching || relatedItemsState.isFetching || isTinymceFetching || isMetaFetching;
	const [activeTab, setActiveTab] = useState(pickDefaultActiveTab(item.itemType, noteKey));

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
	}, [childItemsState, device, itemKey]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown' && ev.target.closest('.tab')) {
			ev.currentTarget.querySelector('.tab-pane.active [tabIndex]').focus();
		}
		if(ev.key === 'Escape') {
			//@TODO: do this in a more elegant way
			document.querySelector('.items-table [tabIndex="0"]').focus();
		}
	});

	const handleSelectTab = ev => {
		setActiveTab(ev.currentTarget.dataset.tabName);
	}

	useEffect(() => {
		const { itemType } = item;

		if(activeTab === 'standalone-note' && itemType !== 'note') {
			setActiveTab(pickDefaultActiveTab(itemType, noteKey));
		}
		if(activeTab === 'standalone-attachment' && itemType !== 'attachment') {
			setActiveTab(pickDefaultActiveTab(itemType, noteKey));
		}

		if(['info', 'notes', 'attachments'].includes(activeTab) &&
			['note', 'attachment'].includes(itemType)) {
			setActiveTab(pickDefaultActiveTab(itemType, noteKey));
		}
	}, [item]);

	return (
		<Panel
			className={ cx({ 'editing': isEditing })}
			bodyClassName={ cx({ 'loading': isLoading && !device.shouldUseTabs }) }
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
								<Tab
									data-tab-name="notes"
									isActive={ activeTab === 'notes' }
									onActivate={ handleSelectTab }
									>
										Notes
								</Tab>
							</React.Fragment>
						)
					}

					<Tab
						data-tab-name="tags"
						isActive={ activeTab === 'tags' }
						onActivate={ handleSelectTab }
					>
						Tags
					</Tab>
					{
						!['attachment', 'note'].includes(item.itemType) && (
							<Tab
							data-tab-name="attachments"
							isActive={ activeTab === 'attachments' }
							onActivate={ handleSelectTab }
							>
								Attachments
							</Tab>
						)
					}

					<Tab
						data-tab-name="related"
						isActive={ activeTab === 'related' }
						onActivate={ handleSelectTab }
					>
						Related
					</Tab>
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
				isLoading && !device.shouldUseTabs ? <Spinner className="large" /> : (
					<React.Fragment>
						{
							!['attachment', 'note'].includes(item.itemType) && (
								<React.Fragment>
									<InfoContainer
										key={ 'info-' + item.key }
										isActive={ activeTab === 'info' }
										isReadOnly={ isReadOnly }
									/>
									<NotesContainer
										key={ 'notes-' + item.key }
										isActive={ activeTab === 'notes' }
										isReadOnly={ isReadOnly }
									/>
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
								<StandaloneAttachmentContainer isActive={ activeTab === 'standalone-attachment' } />
							)
						}

						<TagsContainer
							key={ item.key }
							isActive={ activeTab === 'tags' }
							isReadOnly={ isReadOnly }
						/>
						{
							!['attachment', 'note'].includes(item.itemType) && (
								<AttachmentsContainer
									key={ 'attachments-' + item.key }
									isActive={ activeTab === 'attachments' }
									isReadOnly={ isReadOnly }
								/>
							)
						}
						<RelatedContainer
							key={ 'related-' + item.key }
							isActive={ activeTab === 'related' }
						/>
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
