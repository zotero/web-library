import { Fragment, memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { usePrevious, useForceUpdate } from 'web-common/hooks';

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
import SettingsModal from './modal/settings';
import StyleInstallerModal from './modal/style-installer';
import IdentifierPicker from './modal/identifier-picker';
import ManageTagsModal from './modal/manage-tags';

import { ADD_LINKED_URL_TOUCH, BIBLIOGRAPHY, COLLECTION_ADD, COLLECTION_RENAME, COLLECTION_SELECT,
EXPORT, IDENTIFIER_PICKER, MANAGE_TAGS, MOVE_COLLECTION, NEW_ITEM, SETTINGS, SORT_ITEMS,
STYLE_INSTALLER, ADD_BY_IDENTIFIER, NEW_FILE } from '../constants/modals';

const lookup = {
	[ADD_BY_IDENTIFIER]: AddByIdentifierModal,
	[ADD_LINKED_URL_TOUCH]: AddLinkedUrlTouchModal,
	[BIBLIOGRAPHY]: BibliographyModal,
	[COLLECTION_ADD]: NewCollectionModal,
	[COLLECTION_RENAME]: RenameCollectionModal,
	[COLLECTION_SELECT]: AddItemsToCollectionsModal,
	[EXPORT]: ExportModal,
	[IDENTIFIER_PICKER]: IdentifierPicker,
	[MANAGE_TAGS]: ManageTagsModal,
	[MOVE_COLLECTION]: MoveCollectionsModal,
	[NEW_FILE]: NewFileModal,
	[NEW_ITEM]: NewItemModal,
	[SORT_ITEMS]: ItemsSortModal,
	[STYLE_INSTALLER]: StyleInstallerModal,
	[SETTINGS]: SettingsModal,
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
        <Fragment>
			{ mountedModals.current.map(mId => {
				const ModalComponent = lookup[mId];
				return <ModalComponent key={ mId } />
			}) }
		</Fragment>
    );
}

export default memo(ModalManager);
