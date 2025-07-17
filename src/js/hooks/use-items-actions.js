import { useSelector } from 'react-redux';
import { cleanDOI, cleanURL } from '../utils';

const useCanRecognize = () => {
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const selectedCount = useSelector(state => state.current.itemKeys.length);
	const selectedItemsAreStoredPDFs = useSelector(state => state.current.itemKeys.every(
		key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType === 'attachment'
			&& state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.linkMode === 'imported_file'
			&& state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.contentType === 'application/pdf'
	));
	const canRecognize = !isTrash && !isMyPublications && !isReadOnly && selectedCount > 0 && selectedItemsAreStoredPDFs;
	return canRecognize;
};

const useCanCreateParent = () => {
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const selectedItemsAreAllAttachments = useSelector(state => state.current.itemKeys.length > 0 && state.current.itemKeys.every(
		key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType === 'attachment'
	));
	const canCreateParent = !isTrash && !isMyPublications && selectedItemsAreAllAttachments;
	return canCreateParent;
};

const useCanReparent = () => {
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const selectedItemsAreAllParentable = useSelector(state => state.current.itemKeys.length > 0 && state.current.itemKeys.every(
		key => ['attachment', 'note'].includes(state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType)
	));
	const canReparent = !isTrash && !isMyPublications && selectedItemsAreAllParentable;
	return canReparent;
}

const useCanUnrecognize = () => {
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const selectedCount = useSelector(state => state.current.itemKeys.length);
	const selectedItemsHaveBeenRecognizedRecently = useSelector(state =>
		state.current.itemKeys.every(
			key => !!state.recognize.lookup[`${state.current.libraryKey}-${key}`]
		));
	const canUnregonize = !isTrash && !isMyPublications && !isReadOnly && selectedCount > 0 && selectedItemsHaveBeenRecognizedRecently;
	return canUnregonize;
};

const useItemsActions = () => {
	const item = useSelector(state => state.libraries[state.current.libraryKey]?.items?.[state.current.itemKey] ?? null);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const selectedCount = useSelector(state => state.current.itemKeys.length);

	const attachmentContentType = item?.itemType === 'attachment' ? item.contentType : item?.[Symbol.for('links')]?.attachment?.attachmentType ?? null;
	const isViewFile = !!attachmentContentType;
	const url = item && item.url ? cleanURL(item.url, true) : null;
	const doi = item && item.DOI ? cleanDOI(item.DOI) : null;
	const isViewOnline = !isViewFile && (url || doi);

	const canDuplicate = !isTrash && !isMyPublications && !isReadOnly && item && item.itemType !== 'attachment';
	const canReparent = useCanReparent();
	const canCreateParent = useCanCreateParent();
	const canRecognize = useCanRecognize();
	const canUnregonize = useCanUnrecognize();

	const hasAnyAction = isViewFile || isViewOnline || canDuplicate || canRecognize || canUnregonize || canCreateParent;
	return {
		attachmentContentType, canDuplicate, canCreateParent, canRecognize, canReparent, canUnregonize, doi, hasAnyAction,
		isReadOnly, isViewFile, isTrash, isMyPublications, isViewOnline, item, selectedCount, url
	};
};

export { useItemsActions, useCanRecognize, useCanCreateParent, useCanReparent, useCanUnrecognize };
