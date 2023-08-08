import { useSelector, useDispatch } from 'react-redux';
import deepEqual from 'deep-equal';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
import { usePrevious } from 'web-common/hooks';
import { pick } from 'web-common/utils';
import { DropdownContext, DropdownMenu, DropdownItem, Icon, Spinner } from 'web-common/components';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';

import { annotationItemToJSON } from '../common/annotations.js';
import { ERROR_PROCESSING_ANNOTATIONS } from '../constants/actions';
import {
	deleteItems, fetchChildItems, fetchItemDetails, navigate, tryGetAttachmentURL,
	postAnnotationsFromReader
} from '../actions';
import { pdfWorker } from '../common/pdf-worker.js';
import { useFetchingState } from '../hooks';
import { strings } from '../constants/strings.js';
import TagPicker from './item-details/tag-picker.jsx';
import { READER_CONTENT_TYPES } from '../constants/reader.js';

const PAGE_SIZE = 100;

const UNFETCHED = 0, NOT_IMPORTED = 0;
const FETCHING = 1, IMPORTING = 1;
const FETCHED = 2, IMPORTED = 2;

const Portal = ({ onClose, children }) => {
	const ref = useRef(null);
	const handleClick = useCallback(ev => {
		if (ev.target === ref.current) {
			onClose();
		}
	}, [onClose]);

	return <div
		ref={ref}
		className="portal"
		onClick={handleClick}
	>
		{children}
	</div>;
};

const Overlay = ({ children }) => {
	return <div className="overlay">{children}</div>;
};


const PopupPortal = ({ anchor, children, onClose }) => {
	const { x, y, refs, strategy, update } = useFloating({
		placement: 'bottom-start', middleware: [shift()]
	});
	const isOpen = children !== null;

	// const options = useMemo(() =>
	// 	(context?.itemGroups ?? [])
	// 		.map((group, i) => ([
	// 			...group.map(item => (
	// 				<DropdownItem
	// 					onClick={item.onCommand}
	// 					key={item.label}
	// 				>
	// 					{item.color && (
	// 						<Icon
	// 							aria-role="presentation"
	// 							type="12/square"
	// 							symbol="square"
	// 							width={10}
	// 							height={10}
	// 							style={{ color: item.color }}
	// 						/>
	// 					)}
	// 					{item.label}
	// 				</DropdownItem>
	// 			)),
	// 			...(i < context.itemGroups.length - 1 ? [<DropdownItem key={`group-${i}`} divider />] : [])
	// 		]))
	// 		.flat()
	// 	, [context]);


	useLayoutEffect(() => {
		if (children !== null) {
			update();
		}
	});

	return (
		<Portal onClose={ onClose }>
			{isOpen && (
				<Overlay>
					<div className="anchor" ref={refs.setReference} style={{ position: 'absolute', left: anchor.x, top: anchor.y }} />
					<div className="popup" ref={refs.setFloating} style={{ position: strategy, transform: `translate3d(${x}px, ${y}px, 0px)` }}>
						{ children }
					</div>
				</Overlay>
			)}
		</Portal>
	);
}


const readerReducer = (state, action) => {
	console.log(action);
	switch (action.type) {
		case 'BEGIN_FETCH_DATA':
			return { ...state, dataState: FETCHING };
		case 'COMPLETE_FETCH_DATA':
			return { ...state, dataState: FETCHED, data: action.data };
		case 'ERROR_FETCH_DATA':
			return { ...state, dataState: UNFETCHED, error: action.error };
		default:
		case 'BEGIN_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: IMPORTING };
		case 'COMPLETE_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: IMPORTED, importedAnnotations: action.importedAnnotations };
		case 'ERROR_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: NOT_IMPORTED, error: action.error };
		case 'SKIP_IMPORT_ANNOTATIONS':
			return { ...state, annotationsState: IMPORTED };
		case 'READY':
			return { ...state, isReady: true };
	}
}


const Reader = () => {
	const dispatch = useDispatch();
	const iframeRef = useRef(null);
	const reader = useRef(null);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const attachmentKey = useSelector(state => {
		if (state.current.attachmentKey) {
			return state.current.attachmentKey;
		} else if (state.current.itemKey) {
			return state.current.itemKey;
		} else {
			return null
		}
	});
	const attachmentItem = useSelector(state => state.libraries[libraryKey]?.items[attachmentKey]);
	const isFetchingUrl = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.isFetching ?? false);
	const url = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.url);
	const timestamp = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.timestamp ?? 0);
	const allItems = useSelector(state => state.libraries[libraryKey].items);
	const prevAttachmentItem = usePrevious(attachmentItem);
	const currentUserID = useSelector(state => state.config.userId);
	const currentUserSlug = useSelector(state => state.config.userSlug);
	const tagColors = useSelector(state => state.libraries[libraryKey]?.tagColors?.value ?? {});
	const { isGroup, isReadOnly } = useSelector(state => state.config.libraries.find(l => l.key === libraryKey));
	const pdfReaderURL = useSelector(state => state.config.pdfReaderURL);
	const isCreating = Object.keys(useSelector(state => state.libraries[libraryKey]?.creating?.items)).length > 0;
	const isUpdating = Object.keys(useSelector(state => state.libraries[libraryKey]?.updating?.items)).length > 0;
	const isBusy = isCreating || isUpdating;
	const wasBusy = usePrevious(isBusy);
	const lastFetchItemDetailsNoResults = useSelector(state => {
		const { libraryKey: requestLK, totalResults, queryOptions = {} } = state.traffic?.['FETCH_ITEM_DETAILS']?.last ?? {};
		return totalResults === 0 && requestLK === libraryKey && queryOptions.itemKey === attachmentKey;
	});

	const [state, dispatchState] = useReducer(readerReducer, {
		isReady: false,
		data: null,
		dataState: UNFETCHED,
		annotationsState: NOT_IMPORTED,
		importedAnnotations: []
	});

	const [tagPicker, setTagPicker] = useState(null);
	const anchor = tagPicker ? pick(tagPicker, ['x', 'y']) : null;

	const { isFetching, isFetched, pointer, keys } = useFetchingState(
		['libraries', libraryKey, 'itemsByParent', attachmentKey]
	);
	const urlIsFresh = !!(url && (Date.now() - timestamp) < 60000);

	const annotations = (isFetched && keys ? keys : [])
		.map(childItemKey => allItems[childItemKey])
		.filter(item => !item.deleted && item.itemType === 'annotation');
	const prevAnnotations = usePrevious(annotations);

	const currentUser = useMemo(() => (
		{ id: currentUserID, username: currentUserSlug }
	), [currentUserID, currentUserSlug]);

	const handleClose = useCallback(() => {
		setTagPicker(null);
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

	const handleIframeLoaded = useCallback(() => {
		const processedAnnotations = getProcessedAnnotations(annotations);
		reader.current = iframeRef.current.contentWindow.createReader({
			type: READER_CONTENT_TYPES[attachmentItem.contentType],
			data: { buf: state.data, baseURI: url },
			annotations: [...processedAnnotations, ...state.importedAnnotations],
			state: null,  // Do we want to save PDF reader view state?
			secondaryViewState: null,
			location: null, // Navigate to specific PDF part when opening it
			readOnly: isReadOnly,
			authorName: isGroup ? currentUserSlug : '',
			showItemPaneToggle: true, //  ???
			sidebarWidth: 240,
			sidebarOpen: true, // Save sidebar open/close state?
			bottomPlaceholderHeight: 0, /// ???
			rtl: false, // TODO: ?
			localizedStrings: strings,
			showAnnotations: true,
			onSaveAnnotations: (annotations) => {
				console.log('onSaveAnnotations', annotations);
				dispatch(postAnnotationsFromReader(annotations, attachmentKey));
			},
			onDeleteAnnotations: (annotationIds) => {
				dispatch(deleteItems(annotationIds));
			},
			onChangeViewState: (...args) => {
				console.log('onChangeViewState', args);
			},
			onOpenTagsPopup: (key, x, y) => {
				setTagPicker({ key, x, y});
				console.log('onOpenTagsPopup', { key, x, y });
			},
			onClosePopup: (...args) => {
				// Note: This currently only closes tags popup when annotations are disappearing from pdf-reader sidebar.
				// Normal popup closing is handled by PopupPortal.
				setTagPicker(null);
				console.log('onClosePopup', args);
			},
			onOpenLink: (url) => {
				window.open(url);
				console.log('onOpenLink', url);
			},
			onToggleSidebar: (...args) => {
				console.log('onToggleSidebar', args);
			},
			onChangeSidebarWidth: (...args) => {
				console.log('onChangeSidebarWidth', args);
			},
			onSetDataTransferAnnotations: (...args) => {
				console.log('onSetDataTransferAnnotations', args);
			},
			onConfirm: (title, text, confirmationButtonTitle) => {
				console.log('onConfirm', { title, text, confirmationButtonTitle });
				// todo: consider an async-capable api in reader and a nicer confirmation dialog
				return window.confirm(strings[text] ?? text);
			},
			onCopyImage: (...args) => {
				console.log('onCopyImage', args);
			},
			onSaveImageAs: (...args) => {
				console.log('onSaveImageAs', args);
			},
			onRotatePages: (...args) => {
				console.log('onRotatePages', args);
			},
			onDeletePages: (...args) => {
				console.log('onDeletePages', args);
			},
		});
	}, [annotations, attachmentItem, attachmentKey, currentUserSlug, dispatch, getProcessedAnnotations, isGroup, isReadOnly, state.data, state.importedAnnotations, url])

	// On first render, fetch attachment item details
	useEffect(() => {
		if (attachmentKey && !attachmentItem) {
			dispatch(fetchItemDetails(attachmentKey));
		}
	}, []);// eslint-disable-line react-hooks/exhaustive-deps

	// Fetch all child items (annotations). This effect will execute multiple times for each page of annotations
	useEffect(() => {
		if (!isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(attachmentKey, { start, limit }));
		}
	}, [dispatch, attachmentKey, isFetching, isFetched, pointer]);

	// Fetch attachment URL
	useEffect(() => {
		if (!urlIsFresh && !isFetchingUrl) {
			dispatch(tryGetAttachmentURL(attachmentKey));
		}
	}, [attachmentKey, attachmentItem, dispatch, isFetchingUrl, prevAttachmentItem, urlIsFresh]);

	// Fetch attachment binary data
	useEffect(() => {
		if (urlIsFresh && state.dataState === UNFETCHED) {
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
		if (attachmentItem && state.dataState === FETCHED && state.annotationsState === NOT_IMPORTED) {
			(async () => {
				dispatchState({ type: 'BEGIN_IMPORT_ANNOTATIONS' });
				if (attachmentItem.contentType !== 'application/pdf') {
					dispatchState({ type: 'SKIP_IMPORT_ANNOTATIONS' });
					return;
				}
				try {
					// need to clone data before sending to worker, otherwise it will become detached
					const clonedData = typeof structuredClone === 'function' ? structuredClone(state.data) : state.data.slice(0);
					const importedAnnotations = (await pdfWorker.import(clonedData)).map(
						ia => annotationItemToJSON(ia, { attachmentItem })
					);
					dispatchState({ type: 'COMPLETE_IMPORT_ANNOTATIONS', importedAnnotations });
				} catch (e) {
					dispatchState({ type: 'ERROR_IMPORT_ANNOTATIONS', error: e });
				}
			})();
		}
	}, [attachmentItem, state.annotationsState, state.data, state.dataState]);

	useEffect(() => {
		if (!state.isReady && isFetched && state.data && state.annotationsState == IMPORTED) {
			dispatchState({ type: 'READY' });
		}
	}, [isFetched, state.annotationsState, state.data, state.isReady]);

	useEffect(() => {
		if (attachmentItem && !prevAttachmentItem
			&& (attachmentItem.itemType !== 'attachment' || !Object.keys(READER_CONTENT_TYPES).includes(attachmentItem.contentType))
		) {
			dispatch(navigate({ view: 'item-details' }));
		}
	}, [dispatch, attachmentItem, prevAttachmentItem]);

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
				return !deepEqual(a, prevAnnotations.find(pa => pa.key === a.key))
			});
			reader.current.setAnnotations(getProcessedAnnotations(changedAnnotations));
		}
	}, [annotations, getProcessedAnnotations, isBusy, prevAnnotations, state.importedAnnotations, state.isReady, wasBusy]);

	return (
		<section className="reader-wrapper">
			{state.isReady ? (
				<>
					<iframe onLoad={handleIframeLoaded} ref={iframeRef} src={pdfReaderURL} />
					{ tagPicker && (
						<PopupPortal anchor={ anchor } onClose={ handleClose }>
							{ tagPicker && <TagPicker itemKey={ tagPicker.key } libraryKey={ libraryKey } /> }
						</PopupPortal>
					) }
				</>
			) : (
				<div className="spinner-wrapper">
					<Spinner />
				</div>
			)
			}
		</section>
	);
}

export default memo(Reader);
