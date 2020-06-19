import React, { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import AddByIdentifierModal from './modal/add-by-identifier';
import AddItemsToCollectionsModal from './modal/add-items-to-collections';
import AddLinkedUrlTouchModal from './modal/add-linked-url-touch';
import BibliographyModal from './modal/bibliography';
import ExportModal from './modal/export';
import ItemsSortModal from './modal/items-sort';
import MoveCollectionsModal from './modal/move-collections';
import NewCollectionModal from './modal/new-collection';
import NewFileModal from './modal/new-file';
import NewItemModal from './modal/new-item';
import RenameCollectionModal from './modal/rename-collection';
import StyleInstallerModal from './modal/style-installer';
import { useForceUpdate, usePrevious } from '../hooks';

import { ADD_LINKED_URL_TOUCH, BIBLIOGRAPHY, COLLECTION_ADD, COLLECTION_RENAME, COLLECTION_SELECT,
EXPORT, MOVE_COLLECTION, NEW_ITEM, SORT_ITEMS, STYLE_INSTALLER, ADD_BY_IDENTIFIER, NEW_FILE } from
'../constants/modals';

const lookup = {
	[ADD_LINKED_URL_TOUCH]: AddLinkedUrlTouchModal,
	[COLLECTION_SELECT]: AddItemsToCollectionsModal,
	[BIBLIOGRAPHY]: BibliographyModal,
	[EXPORT]: ExportModal,
	[SORT_ITEMS]: ItemsSortModal,
	[MOVE_COLLECTION]: MoveCollectionsModal,
	[COLLECTION_ADD]: NewCollectionModal,
	[NEW_ITEM]: NewItemModal,
	[COLLECTION_RENAME]: RenameCollectionModal,
	[STYLE_INSTALLER]: StyleInstallerModal,
	[ADD_BY_IDENTIFIER]: AddByIdentifierModal,
	[NEW_FILE]: NewFileModal,
};

const UNMOUNT_DELAY = 500; // to allow outro animatons (delay in ms)

const ModalManager = () => {
	const mountedModals = useRef([]);
	const unmountTimeouts = useRef({});
	const modalId = useSelector(state => state.modal.id);
	const prevModalId = usePrevious(modalId);
	const forceUpdate = useForceUpdate();

	useEffect(() => {
		if(modalId !== prevModalId) {
			if(modalId in unmountTimeouts.current) {
				// reopening modal that is about to unmount, cancel unmount timer
				clearTimeout(unmountTimeouts.current[modalId]);
				delete unmountTimeouts.current[modalId];
			}
			if(prevModalId) {
				// start timer to unmount modal that just has been closed
				unmountTimeouts.current[prevModalId] = setTimeout(() => {
					mountedModals.current = mountedModals.current.filter(mId => mId !== prevModalId);
					delete unmountTimeouts.current[prevModalId];
					forceUpdate();
				}, UNMOUNT_DELAY);
			}
			if(modalId && !mountedModals.current.includes(modalId)) {
				// mount new modal
				mountedModals.current.push(modalId);
				forceUpdate();
			}
		}
	}, [modalId, prevModalId, forceUpdate]);

	return (
		<React.Fragment>
			{ mountedModals.current.map(mId => {
				const ModalComponent = lookup[mId];
				return <ModalComponent key={ mId } />
			}) }
		</React.Fragment>
	);
}

export default memo(ModalManager);
