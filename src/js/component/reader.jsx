import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import deepEqual from 'deep-equal';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { usePrevious } from 'web-common/hooks';
import { pick, noop } from 'web-common/utils';
import { getLastPageIndexSettingKey } from '../common/item';
import { Spinner } from 'web-common/components';
import { useFloating, flip, shift } from '@floating-ui/react-dom';
import PropTypes from 'prop-types';
import strings from "pdf-reader/src/en-us.strings";

import { annotationItemToJSON } from '../common/annotations';
import { ERROR_PROCESSING_ANNOTATIONS } from '../constants/actions';
import {
	deleteItems, deleteLibrarySettings, fetchChildItems, fetchItemDetails, fetchLibrarySettings, navigate, patchAttachment,
	postAnnotationsFromReader, preferenceChange, tryGetAttachmentURL, updateLibrarySettings, uploadAttachment
} from '../actions';
import { PDFWorker } from '../common/pdf-worker';
import { getItemViewState, updateItemViewState } from '../common/viewstate'
import { useItemsState, useTrackedSettingsKey } from '../hooks';
import TagPicker from './item-details/tag-picker';
import { READER_CONTENT_TYPES } from '../constants/reader';
import Portal from './portal';
import { getItemFromApiUrl, isReaderCompatibleBrowser } from '../utils';
import { forumsUrl } from '../constants/defaults';

const PAGE_SIZE = 100;

const NOT_READY = 0;
const RUNNING = 1;
const READY = 2;
const ERROR = 3;

const PAGE_INDEX_KEY_LOOKUP = {
	'application/pdf': 'pageIndex',
	'application/epub+zip': 'cfi',
	'text/html': 'scrollYPercent'
};

import DiffWorker from 'web-worker:../diff.worker';

const cloneData = (data) => typeof structuredClone === 'function' ? structuredClone(data) : data.slice(0);

const computeDiffUsingWorker = (oldFile, newFile, xdelta3Url) => {
	return new Promise((resolve, reject) => {
		const dataWorker = new DiffWorker();
		dataWorker.postMessage(['LOAD', { oldFile: cloneData(oldFile), newFile: cloneData(newFile), xdelta3Url }]);
		dataWorker.addEventListener('message', function (ev) {
			const [command, payload] = ev.data;
			switch (command) {
				case 'READY':
					dataWorker.postMessage(['DIFF']);
					break;
				case 'DIFF_COMPLETE':
					resolve(payload);
					break;
				case 'ERROR':
					console.error('DiffWorker error', payload);
					reject(payload);
					break;
				case 'LOG':
					console.warn(payload);
					break;
			}
		});
	});
};


const PopupPortal = memo(({ anchor, children, onClose }) => {
	const { x, y, refs, strategy, update } = useFloating({
		placement: 'bottom-start', middleware: [shift(), flip()]
	});
	const isOpen = children !== null;

	useLayoutEffect(() => {
		if (children !== null) {
			update();
		}
	});

	return (
		<Portal onClose={ onClose }>
			{isOpen && (
				<>
					<div className="anchor" ref={refs.setReference} style={{ position: 'absolute', left: anchor.x, top: anchor.y }} />
					<div className="popup" ref={refs.setFloating} style={{ position: strategy, transform: `translate3d(${x}px, ${y}px, 0px)` }}>
						{ children }
					</div>
				</>
			)}
		</Portal>
	);
});

PopupPortal.displayName = 'PopupPortal';
PopupPortal.propTypes = {
	anchor: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}),
	children: PropTypes.node,
	onClose: PropTypes.func.isRequired,
};

const readerReducer = (state, action) => {
	switch (action.type) {
		case 'ROUTE_CONFIRMED':
			return { ...state, isRouteConfirmed: true }
		case 'BEGIN_FETCH_SETTINGS':
			return { ...state, settingsStatus: RUNNING }
		case 'COMPLETE_FETCH_SETTINGS':
			return { ...state, settingsStatus: READY }
		case 'BEGIN_VIEW_STATE_CHANGED':
			return { ...state, newState: action.value }
		case 'COMPLETE_VIEW_STATE_CHANGED':
			return { ...state, newState: null }
		case 'BEGIN_FETCH_DATA':
			return { ...state, dataState: RUNNING };
		case 'COMPLETE_FETCH_DATA':
			return { ...state, dataState: READY, data: action.data };
		case 'ERROR_FETCH_DATA':
			return { ...state, dataState: NOT_READY, error: action.error };
		case 'BEGIN_READ_VIEWSTATE':
			return { ...state, viewStateStatus: RUNNING }
		case 'COMPLETE_READ_VIEWSTATE':
			return { ...state, viewStateStatus: READY, viewState: action.viewState }
		case 'ERROR_READ_VIEWSTATE':
			return { ...state, viewStateStatus: ERROR, viewState: null }
		case 'BEGIN_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: RUNNING };
		case 'COMPLETE_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: READY, importedAnnotations: action.importedAnnotations };
		case 'ERROR_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: READY, error: action.error };
		case 'SKIP_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: READY };
		case 'READY':
			return { ...state, isReady: true };
		case 'ROTATE_PAGES':
			return { ...state, action };
		case 'ROTATING_PAGES':
			return { ...state, action: null };
		case 'ROTATED_PAGES':
			return { ...state, action: null, data: action.data };
		case 'SAVE_CUSTOM_THEMES':
			return { ...state, updateCustomThemesState: NOT_READY, nextCustomThemes: action.themes };
		case 'SAVING_CUSTOM_THEMES':
			return { ...state, updateCustomThemesState: RUNNING };
		case 'SAVED_CUSTOM_THEMES':
			return { ...state, updateCustomThemesState: READY, nextCustomThemes: null };
		default:
			return state;
	}
}


const Reader = () => {
	const dispatch = useDispatch();
	const iframeRef = useRef(null);
	const reader = useRef(null);
	const editedAnnotations = useRef(new Set());
	const pendingViewState = useRef(null);
	const userLibraryKey = useSelector(state => state.current.userLibraryKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const attachmentKey = useSelector(state => {
		if (state.current.attachmentKey) {
			return state.current.attachmentKey;
		} else if (state.current.itemKey) {
			return state.current.itemKey;
		} else {
			return null;
		}
	});
	const location = useSelector(state => state.current.location);
	const pageIndexSettingKey = getLastPageIndexSettingKey(attachmentKey, libraryKey);
	const { value: locationValue, update: updateLocationValueSync } = useTrackedSettingsKey(pageIndexSettingKey, userLibraryKey);
	const customThemes = useSelector(state => state.libraries[libraryKey]?.settings?.entries?.readerCustomThemes?.value);
	const isFetchingCustomThemes = useSelector(state => state.libraries[libraryKey]?.settings?.entries?.readerCustomThemes?.isFetching ?? false);
	const attachmentItem = useSelector(state => state.libraries[libraryKey]?.items[attachmentKey]);
	const isFetchingUrl = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.isFetching ?? false);
	const url = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.url);
	const timestamp = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.timestamp ?? 0);
	const allItems = useSelector(state => state.libraries[libraryKey]?.items);
	const prevAttachmentItem = usePrevious(attachmentItem);
	const currentUserID = useSelector(state => state.config.userId);
	const currentUserSlug = useSelector(state => state.config.userSlug);
	const pdfWorkerURL = useSelector(state => state.config.pdfWorkerURL);
	const pdfReaderCMapsURL = useSelector(state => state.config.pdfReaderCMapsURL);
	const pdfReaderStandardFontsURL = useSelector(state => state.config.pdfReaderStandardFontsURL);
	const xdelta3Url = useSelector(state => state.config.xdelta3Url);
	const tagColors = useSelector(state => state.libraries[libraryKey]?.tagColors?.value ?? []);
	const { isGroupLibrary: isGroup, isReadOnly } = useSelector(state => state.config.libraries.find(l => l.key === libraryKey));
	const pdfReaderURL = useSelector(state => state.config.pdfReaderURL);
	const isCreating = Object.keys(useSelector(state => state.libraries[libraryKey]?.creating?.items) ?? {}).length > 0;
	const isUpdating = Object.keys(useSelector(state => state.libraries[libraryKey]?.updating?.items) ?? {}).length > 0;
	const isBusy = isCreating || isUpdating;
	const wasBusy = usePrevious(isBusy);
	const lastFetchItemDetailsNoResults = useSelector(state => {
		const { libraryKey: requestLK, totalResults, queryOptions = {} } = state.traffic?.['FETCH_ITEM_DETAILS']?.last ?? {};
		return totalResults === 0 && requestLK === libraryKey && queryOptions.itemKey === attachmentKey;
	});
	const isReaderSidebarOpen = useSelector(state => state.preferences?.isReaderSidebarOpen);
	const readerSidebarWidth = useSelector(state => state.preferences?.readerSidebarWidth);
	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const lightTheme = useSelector(state => state.preferences?.readerLightTheme ?? false);
	const darkTheme = useSelector(state => state.preferences?.readerDarkTheme ?? false);
	const pdfWorker = useMemo(() => new PDFWorker({ pdfWorkerURL, pdfReaderCMapsURL, pdfReaderStandardFontsURL }), [pdfReaderCMapsURL, pdfReaderStandardFontsURL, pdfWorkerURL]);

	const [state, dispatchState] = useReducer(readerReducer, {
        action: null,
        annotationsState: NOT_READY,
        data: null,
        dataState: NOT_READY,
        importedAnnotations: [],
        isReady: false,
        isRouteConfirmed: false,
		settingsStatus: NOT_READY,
        viewStateStatus: NOT_READY,
        newState: null,
        viewState: null,
		updateCustomThemesState: READY,
		nextCustomThemes: null
    });

	const [tagPicker, setTagPicker] = useState(null);
	const anchor = tagPicker ? pick(tagPicker, ['x', 'y']) : null;

	const { isFetching, isFetched, pointer, keys } = useItemsState(
		['libraries', libraryKey, 'itemsByParent', attachmentKey]
	);
	const urlIsFresh = !!(url && (Date.now() - timestamp) < 60000);

	const annotations = (isFetched && keys ? keys : [])
		.map(childItemKey => allItems[childItemKey])
		.filter(item => !item.deleted && item.itemType === 'annotation');
	const prevAnnotations = usePrevious(annotations);

	const currentUser = useMemo(() => (
		{ id: parseInt(currentUserID), username: currentUserSlug }
	), [currentUserID, currentUserSlug]);

	const handleClose = useCallback(() => {
		setTagPicker(null);
		iframeRef.current.focus();
	}, []);

	const getProcessedAnnotations = useCallback((annotations) => {
		const tagColorsMap = new Map(tagColors.map(
			({ name, color }, position) => ([name, { tag: name, color, position }]))
		);
		// @TODO: add mapping for Mendeley colors
		try {
			return annotations.map(annotation => {
				const { createdByUser, lastModifiedByUser } = annotation?.[Symbol.for('meta')] ?? {};
				return annotationItemToJSON(annotation, {
					attachmentItem, createdByUser, currentUser, isGroup, isReadOnly,
					lastModifiedByUser, libraryKey, tagColors: tagColorsMap
				});
			});
		} catch (e) {
			dispatch({
				type: ERROR_PROCESSING_ANNOTATIONS,
				error: "Failed to process annotations"
			});
			console.error(e);
		}
	}, [attachmentItem, currentUser, dispatch, isGroup, isReadOnly, libraryKey, tagColors]);

	const rotatePages = useCallback(async (oldBuf, pageIndexes, degrees) => {
		reader.current.freeze();
		const modifiedBuf = await pdfWorker.rotatePages(cloneData(oldBuf), pageIndexes, degrees, true);
		reader.current.reload({ buf: new Uint8Array(cloneData(modifiedBuf)), baseURI: url });
		reader.current.unfreeze();
		dispatchState({ type: 'ROTATED_PAGES', data: cloneData(modifiedBuf) });
		try {
			const diff = await computeDiffUsingWorker(oldBuf, modifiedBuf, xdelta3Url);
			dispatch(patchAttachment(attachmentItem.key, modifiedBuf, diff));
		} catch(e) {
			console.warn("Failed to compute diff. Falling back to uploading the entire file.", e);
			dispatch(uploadAttachment(
				attachmentItem.key, { fileName: attachmentItem.filename, file: cloneData(modifiedBuf) })
			);
		}
	}, [attachmentItem, dispatch, pdfWorker, url, xdelta3Url]);

	const handleKeyDown = useCallback((ev) => {
		if (ev.key === 'Escape') {
			setTagPicker(null);
			iframeRef.current.focus();
		}
	}, []);


	const handleChangeViewStateDebounced = useDebouncedCallback(useCallback((newViewState) => {
		dispatchState({ type: 'BEGIN_VIEW_STATE_CHANGED', value: newViewState});
	}, []), 1000);

	// NOTE: handler can't be updated once it has been passed to Reader
	const handleChangeViewState = useCallback((newViewState, isPrimary) => {
		if (isPrimary) {
			pendingViewState.current = newViewState;
			handleChangeViewStateDebounced(newViewState, isPrimary);
		}
	}, [handleChangeViewStateDebounced]);

	// NOTE: handler can't be updated once it has been passed to Reader
	const handleToggleSidebar = useDebouncedCallback(useCallback((isOpen) => {
		dispatch(preferenceChange('isReaderSidebarOpen', isOpen));
	}, [dispatch]), 1000);

	// NOTE: handler can't be updated once it has been passed to Reader
	const handleResizeSidebar = useDebouncedCallback(useCallback((newWidth) => {
		dispatch(preferenceChange('readerSidebarWidth', newWidth));
	}, [dispatch]), 1000);

	const handleIframeLoaded = useCallback(() => {
		const processedAnnotations = getProcessedAnnotations(annotations);
		const pageIndexKey = PAGE_INDEX_KEY_LOOKUP[attachmentItem.contentType];
		const readerState = {
			fileName: attachmentItem.filename,
			[pageIndexKey]: locationValue,
			...(state.viewState ?? {})
		};

		reader.current = iframeRef.current.contentWindow.createReader({
			type: READER_CONTENT_TYPES[attachmentItem.contentType],
			data: {
				buf: new Uint8Array(cloneData(state.data)),
				baseURI: new URL('/', window.location).toString()
			},
			annotations: [...processedAnnotations, ...state.importedAnnotations],
			colorScheme,
			customThemes: customThemes ?? [],
			lightTheme: lightTheme || undefined, // reader compares to undefined to determine if it should pick the default theme
			darkTheme: darkTheme || undefined,	// https://github.com/zotero/reader/blob/4f74ec4d14277ed10d8a805052e822d0a4d50762/src/common/reader.js#L134
			primaryViewState: readerState,
			secondaryViewState: null,
			location,
			readOnly: isReadOnly,
			authorName: isGroup ? currentUserSlug : '',
			showItemPaneToggle: false,
			sidebarWidth: readerSidebarWidth,
			sidebarOpen: isReaderSidebarOpen ?? true,
			bottomPlaceholderHeight: 0,
			rtl: false,
			localizedStrings: strings,
			showAnnotations: true,
			onSaveAnnotations: (annotations) => {
				const annotationKeys = annotations.map(a => a.id);
				annotationKeys.forEach(ak => editedAnnotations.current.add(ak));
				dispatch(postAnnotationsFromReader(annotations, attachmentKey));
			},
			onDeleteAnnotations: (annotationIds) => {
				dispatch(deleteItems(annotationIds));
			},
			onChangeViewState: handleChangeViewState,
			onOpenTagsPopup: (key, x, y) => {
				setTagPicker({ key, x, y});
				setTimeout(() => {
					document.querySelector('.add-tag').focus();
				}, 0);
			},
			onClosePopup: () => {
				// Note: This currently only closes tags popup when annotations are disappearing from pdf-reader sidebar.
				// Normal popup closing is handled by PopupPortal.
				setTagPicker(null);
			},
			onOpenLink: (url) => {
				window.open(url);
			},
			onToggleSidebar: handleToggleSidebar,
			onChangeSidebarWidth: handleResizeSidebar,
			onConfirm: (_title, text, _confirmationButtonTitle) => { // eslint-disable-line no-unused-vars
				return window.confirm(strings[text] ?? text);
			},
			onRotatePages: async (pageIndexes, degrees) => {
				dispatchState({ type: 'ROTATE_PAGES', pageIndexes, degrees });
			},
			onSetDataTransferAnnotations: noop, // n/a in web library, noop prevents errors printed on console from reader
			// onDeletePages: handleDeletePages,
			onSetLightTheme: (themeName) => {
				dispatch(preferenceChange('readerLightTheme', themeName || false));
			},
			onSetDarkTheme: (themeName) => {
				dispatch(preferenceChange('readerDarkTheme', themeName || false));
			},
			onSaveCustomThemes: async (themes) => {
				dispatchState({ type: 'SAVE_CUSTOM_THEMES', themes });
			},
		});
	}, [
		annotations, attachmentItem, attachmentKey, colorScheme, currentUserSlug, darkTheme, dispatch,
		getProcessedAnnotations, handleChangeViewState, handleResizeSidebar, handleToggleSidebar, isGroup,
		isReadOnly, isReaderSidebarOpen, lightTheme, location, locationValue, readerSidebarWidth, state.data,
		state.importedAnnotations, state.viewState, customThemes
	]);

	const handleOnBeforeUnload = useCallback(() => {
		if (pendingViewState.current) {
			const pageIndexKey = PAGE_INDEX_KEY_LOOKUP[attachmentItem.contentType];
			updateItemViewState(attachmentItem.key, libraryKey, pendingViewState.current);
			updateLocationValueSync(pendingViewState.current[pageIndexKey]);
		}
	}, [attachmentItem, libraryKey, updateLocationValueSync]);

	const fetchSettings = useCallback(async () => {
		dispatchState({ type: 'BEGIN_FETCH_SETTINGS' });
		try {
			await Promise.all([
				dispatch(fetchLibrarySettings(userLibraryKey, pageIndexSettingKey)),
				dispatch(fetchLibrarySettings(userLibraryKey, 'readerCustomThemes'))
			]);
		} finally {
			dispatchState({ type: 'COMPLETE_FETCH_SETTINGS' });
		}
	}, [dispatch, pageIndexSettingKey, userLibraryKey]);

	const updateCustomThemes = useCallback(async () => {
		const themes = state.nextCustomThemes;
		dispatchState({ type: 'SAVING_CUSTOM_THEMES' });
		try {
			if (lightTheme && lightTheme.startsWith('custom') && !themes?.some(theme => theme.id === lightTheme)) {
				await dispatch(preferenceChange('readerLightTheme', false));
			}

			if (darkTheme && darkTheme.startsWith('custom') && !themes?.some(theme => theme.id === darkTheme)) {
				await dispatch(preferenceChange('readerDarkTheme', false));
			}

			if (themes.length) {
				await dispatch(updateLibrarySettings('readerCustomThemes', themes, userLibraryKey));
			} else {
				await dispatch(deleteLibrarySettings('readerCustomThemes', userLibraryKey));
			}
		} catch (e) {
			console.error(e);
		} finally {
			dispatchState({ type: 'SAVED_CUSTOM_THEMES' });
		}
	}, [darkTheme, dispatch, lightTheme, state.nextCustomThemes, userLibraryKey]);

	useEffect(() => {
		// pdf js stores last page in localStorage but we want to use one from user library settings instead
		localStorage.removeItem('pdfjs.history');
	}, []);

	useEffect(() => {
		window.addEventListener("beforeunload", handleOnBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleOnBeforeUnload);
		}
	}, [handleOnBeforeUnload]);

	useEffect(() => {
		if(!attachmentKey) {
			return;
		}

		const checkViewState = async () => {
			dispatchState({ type: 'BEGIN_READ_VIEWSTATE' });
			try {
				const viewState = await getItemViewState(attachmentKey, libraryKey);
				dispatchState({ type: 'COMPLETE_READ_VIEWSTATE', viewState });
			} catch (e) {
				dispatchState({ type: 'ERROR_READ_VIEWSTATE'});
			}
		};
		if (state.viewStateStatus === NOT_READY) {
			checkViewState();
		}
	}, [attachmentKey, libraryKey, state.viewStateStatus]);

	useEffect(() => {
		if(reader.current) {
			reader.current.setColorScheme(colorScheme);
		}
	}, [colorScheme]);

	useEffect(() => {
		if (reader.current) {
			reader.current.setLightTheme(lightTheme || undefined);
		}
	}, [lightTheme]);

	useEffect(() => {
		if (reader.current) {
			reader.current.setDarkTheme(darkTheme || undefined);
		}
	}, [darkTheme]);

	useEffect(() => {
		if (!isFetchingCustomThemes && reader.current) {
			reader.current.setCustomThemes(customThemes ?? []);
		}
	}, [customThemes, isFetchingCustomThemes]);

	// fetch attachment item details or redirect if invalid URL
	useEffect(() => {
		if(!attachmentKey) {
			dispatch(navigate({ items: null, attachmentKey: null, noteKey: null, view: 'item-list' }));
		}
		if (attachmentKey && !attachmentItem) {
			dispatch(fetchItemDetails(attachmentKey));
		}

	}, [attachmentItem, attachmentKey, dispatch]);

	useEffect(() => {
		if (libraryKey !== userLibraryKey && libraryKey.startsWith('u')) {
			// Opening reader for an item in a public user library is not supported.
			// It cannot work because API does not include 'enclosure' link for attachments in public user libraries.
			// Redirect to item details instead.
			dispatch(navigate({ view: 'item-details', location: null }));
		}
	}, [dispatch, libraryKey, userLibraryKey]);

	// Fetch all child items (annotations). This effect will execute multiple times for each page of annotations
	useEffect(() => {
		if (state.isRouteConfirmed && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(attachmentKey, { start, limit }));
		}
	}, [attachmentKey, dispatch, isFetched, isFetching, pointer, state.isRouteConfirmed]);

	// Fetch attachment URL
	useEffect(() => {
		if (state.isRouteConfirmed && !urlIsFresh && !isFetchingUrl) {
			dispatch(tryGetAttachmentURL(attachmentKey));
		}
	}, [attachmentKey, attachmentItem, dispatch, isFetchingUrl, prevAttachmentItem, urlIsFresh, state.isRouteConfirmed]);

	// Fetch attachment binary data
	useEffect(() => {
		if (urlIsFresh && state.dataState === NOT_READY) {
			(async () => {
				dispatchState({ type: 'BEGIN_FETCH_DATA' });
				try {
					const data = await (await fetch(url)).arrayBuffer();
					dispatchState({ type: 'COMPLETE_FETCH_DATA', data });
				} catch (e) {
					dispatchState({ type: 'ERROR_FETCH_DATA', error: e });
				}
			})();
		}
	}, [state.dataState, url, urlIsFresh]);

	// import external annotations
	useEffect(() => {
		if (attachmentItem && state.dataState === READY && state.annotationsState === NOT_READY) {
			(async () => {
				dispatchState({ type: 'BEGIN_IMPORT_ANNOTATIONS' });
				if (attachmentItem.contentType !== 'application/pdf') {
					dispatchState({ type: 'SKIP_IMPORT_ANNOTATIONS' });
					return;
				}
				try {
					// need to clone data before sending to worker, otherwise it will become detached
					const clonedData = cloneData(state.data);
					const importedAnnotations = (await pdfWorker.import(clonedData)).map(
						ia => annotationItemToJSON(ia, { attachmentItem })
					);
					dispatchState({ type: 'COMPLETE_IMPORT_ANNOTATIONS', importedAnnotations });
				} catch (e) {
					dispatchState({ type: 'ERROR_IMPORT_ANNOTATIONS', error: e });
				}
			})();
		}
	}, [attachmentItem, pdfWorker, state.annotationsState, state.data, state.dataState]);

	useEffect(() => {
		const viewStateReadyOrError = [READY, ERROR].includes(state.viewStateStatus);
		if (!state.isReady && isFetched && state.data && state.annotationsState === READY && viewStateReadyOrError && state.settingsStatus === READY) {
			dispatchState({ type: 'READY' });
		}
	}, [isFetched, state.annotationsState, state.data, state.isReady, state.settingsStatus, state.viewStateStatus]);

	useEffect(() => {
		if (state.isRouteConfirmed && state.settingsStatus === NOT_READY) {
			fetchSettings();
		}
	}, [fetchSettings, state.isRouteConfirmed, state.settingsStatus]);

	useEffect(() => {
		// item is reader compatible if it is an attachment, has a supported content type, and has an enclosure link
		const isCompatible = (attachmentItem?.itemType === 'attachment' && Object.keys(READER_CONTENT_TYPES).includes(attachmentItem?.contentType) && attachmentItem?.[Symbol.for('links')]?.enclosure);
		if (attachmentItem && !prevAttachmentItem && !isCompatible) {
			// item the URL points to is not a compatible attachment. We can try to navigate to the best attachment
			const bestAttachment = attachmentItem?.[Symbol.for('links')]?.attachment;
			const bestAttachmentKey = bestAttachment ? getItemFromApiUrl(bestAttachment.href) : null;
			if (bestAttachmentKey) {
				dispatch(navigate({ items: attachmentItem.key, attachmentKey: bestAttachmentKey }));
			} else {
				// best attachment not found, redirect to item details
				dispatch(navigate({ view: 'item-details', location: null }));
			}
		} else if (!state.isRouteConfirmed && attachmentItem !== !prevAttachmentItem && isCompatible) {
			dispatchState({ type: 'ROUTE_CONFIRMED' });
		}
	}, [dispatch, attachmentItem, prevAttachmentItem, state.isRouteConfirmed]);

	useEffect(() => {
		if (lastFetchItemDetailsNoResults) {
			dispatch(navigate({ items: null, attachmentKey: null, noteKey: null, view: 'item-list' }));
		}
	}, [dispatch, lastFetchItemDetailsNoResults]);

	useEffect(() => {
		if (state.isReady && (!deepEqual(prevAnnotations, annotations) || (wasBusy && !isBusy))) {
			if (isBusy) {
				return;
			}
			const changedAnnotations = annotations.filter(a => {
				if (editedAnnotations.current.has(a.key)) {
					editedAnnotations.current.delete(a.key);
					return false;
				}
				return true;
			}).filter(a => {
				return !deepEqual(a, prevAnnotations.find(pa => pa.key === a.key))
			});

			const deletedAnnotations = prevAnnotations
				.filter(pa => !annotations.find(a => a.key === pa.key))
				.map(a => a.key);

			reader.current.setAnnotations(getProcessedAnnotations(changedAnnotations));
			reader.current.unsetAnnotations(deletedAnnotations);
		}
	}, [annotations, getProcessedAnnotations, isBusy, prevAnnotations, state.importedAnnotations, state.isReady, wasBusy]);

	useEffect(() => {
		if (state.isReady && state.action?.type === 'ROTATE_PAGES') {
			dispatchState({ type: 'ROTATING_PAGES' });
			rotatePages(state.data, state.action.pageIndexes, state.action.degrees);
		}
	}, [rotatePages, state.action, state.data, state.isReady]);

	useEffect(() => {
		if (state.updateCustomThemesState === NOT_READY) {
			updateCustomThemes();
		}
	}, [state.updateCustomThemesState, updateCustomThemes])

	useEffect(() => {
		if (attachmentItem && state.newState !== null) {
			const pageIndexKey = PAGE_INDEX_KEY_LOOKUP[attachmentItem?.contentType];
			let promises = [];
			if (userLibraryKey && pageIndexKey && (state.newState?.[pageIndexKey] ?? null) !== null && state.newState[pageIndexKey] !== '') {
				promises.push(
					dispatch(updateLibrarySettings(pageIndexSettingKey, state.newState[pageIndexKey], userLibraryKey, { ignore: true }))
				);
			}
			try {
				promises.push(
					updateItemViewState(attachmentItem.key, libraryKey, state.newState)
				);
			} catch (e) {
				console.error(e); // unable to write to indexedDB, which means viewState won't be saved
			}
			Promise.allSettled(promises).then(() => {
				pendingViewState.current = null;
				dispatchState({ type: 'COMPLETE_VIEW_STATE_CHANGED' });
			});
		}
	}, [attachmentItem, dispatch, libraryKey, pageIndexSettingKey, state.newState, userLibraryKey]);

	return (
    <section className="reader-wrapper" onKeyDown={handleKeyDown} tabIndex="0">
		{isReaderCompatibleBrowser() ? (
        state.isReady ? (
          <>
            <iframe onLoad={handleIframeLoaded} ref={iframeRef} src={pdfReaderURL} />
            {tagPicker && (
              <PopupPortal anchor={anchor} onClose={handleClose}>
                {tagPicker && <TagPicker itemKey={tagPicker.key} libraryKey={libraryKey} />}
              </PopupPortal>
            )}
          </>
        ) : (
          <div className="spinner-wrapper">
            <Spinner />
          </div>
        )
      ) : (
        <div className="incompatible">
          <h1>Incompatible Browser</h1>
          <p>
            Your browser appears to be too old to display Reader. Please ensure you are using a
            recent version of your browser. We recommend using the latest version of Firefox,
            Chrome, Safari, or Edge.
          </p>
          <p>
            If you see this message despite using a recent version of a major browser, please report
            this issue on the <a href={forumsUrl}>Zotero forums</a> and mention <em>web library</em> in the thread title.
          </p>
        </div>
      )}
    </section>
  );
}

export default memo(Reader);
