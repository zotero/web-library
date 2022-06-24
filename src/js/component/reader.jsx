import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveAs } from 'file-saver';
import deepEqual from 'deep-equal';

import { annotationItemToJSON } from '../common/annotations.js';
import { pdfWorker } from '../common/pdf-worker.js';
import { fetchChildItems, fetchItemDetails, navigate, tryGetAttachmentURL } from '../actions';
import { useFetchingState, usePrevious } from '../hooks';
import Button from './ui/button';
import Spinner from './ui/spinner';
import { ERROR_PROCESSING_ANNOTATIONS } from '../constants/actions';

const PAGE_SIZE = 100;

const Reader = () => {
	const dispatch = useDispatch();
	const iframeRef = useRef(null);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const attachmentKey = useSelector(state => {
		if(state.current.attachmentKey) {
			return state.current.attachmentKey;
		} else if(state.libraries[libraryKey]?.items[state.current.itemKey].itemType === 'attachment') {
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
	const [dataState, setDataState] = useState({ isReady: false, processedAnnotations: [], importedAnnotations: [] });

	const { isFetching, isFetched, pointer, keys } = useFetchingState(
		['libraries', libraryKey, 'itemsByParent', attachmentKey]
	);
	const urlIsFresh = !!(url && (Date.now() - timestamp) < 60000);
	const isAllFetched = isFetched && urlIsFresh;
	const wasAllFetched = usePrevious(isAllFetched);

	const annotations = (isFetched && keys ? keys : [])
		.map(childItemKey => allItems[childItemKey])
		.filter(item => !item.deleted && item.itemType === 'annotation');
	const prevAnnotations = usePrevious(annotations);

	const currentUser = useMemo(() => (
		{ id: currentUserID, username: currentUserSlug }
	), [currentUserID, currentUserSlug]);

	const getProcessedAnnotations = useCallback(() => {
		const tagColorsMap = new Map(tagColors.map(
			({ name, color }, position) => ([name, { tag: name, color, position }]))
		);
		try {
			return annotations.map(a => {
				const { createdByUser, lastModifiedByUser } = a?.[Symbol.for('meta')] ?? {};
				return annotationItemToJSON(a, { createdByUser, currentUser, isGroup, isReadOnly, lastModifiedByUser, libraryKey, tagColors: tagColorsMap })
			});
		} catch (e) {
			dispatch({
				type: ERROR_PROCESSING_ANNOTATIONS,
				error: "Failed to process annotations"
			});
			console.error(e);
		}
	}, [annotations, currentUser, dispatch, isGroup, isReadOnly, libraryKey, tagColors]);

	const handleGoBack = useCallback(() => {
		dispatch(navigate({ attachmentKey, view: 'item-details' }));
	}, [attachmentKey, dispatch]);

	const handleExport = useCallback(() => {
		iframeRef.current.contentWindow.save();
	}, [])

	const handleIframeMessage = useCallback(async (event) => {
		if (event.source !== iframeRef.current.contentWindow) {
			return;
		}
		const message = event.data;
		switch (message.action) {
			case 'initialized': {
				return;
			}
			case 'loadExternalAnnotations': {
				const importedAnnotations = (await pdfWorker.import(message.buf)).map(ia => annotationItemToJSON(ia));
				const allAnnotations = [...dataState.processedAnnotations, ...importedAnnotations];
				iframeRef.current.contentWindow.postMessage({
					action: 'setAnnotations',
					annotations: allAnnotations
				});
				setDataState({ ...dataState, importedAnnotations });
				return;
			}
			case 'save': {
				const buf = await pdfWorker.export(message.buf, annotations);
				const blob = new Blob([buf], { type: "application/pdf" });
				const blobUrl = URL.createObjectURL(blob);
				const fileName = attachmentItem?.filename || 'file.pdf';
				saveAs(blobUrl, fileName);
				return;
			}
			case 'setState': {
				// message.state;
				return;
			}
		}
	}, [annotations, dataState, attachmentItem]);

	const handleIframeLoaded = useCallback(() => {
		iframeRef.current.contentWindow.addEventListener('message', handleIframeMessage);
		iframeRef.current.contentWindow.postMessage({
			action: 'open',
			url,
			annotations: dataState.processedAnnotations,
			state: null, // Do we want to save PDF reader view state?
			location: null, // Navigate to specific PDF part when opening it
			readOnly: true,
			authorName: isGroup ? currentUserSlug : '',
			sidebarWidth: 240, // Save sidebar width?
			sidebarOpen: true, // Save sidebar open/close state?
			rtl: false // TODO: ?
		});
	}, [currentUserSlug, dataState, isGroup, handleIframeMessage, url])

	useEffect(() => {
		if(!attachmentKey) {
			console.log('not a pdf, redirecting!');
			dispatch(navigate({ view: 'item-details' }));
		}
		if(attachmentKey && !attachmentItem) {
			dispatch(fetchItemDetails(attachmentKey));
		}
	}, []);// eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if(!isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			dispatch(fetchChildItems(attachmentKey, { start, limit }));
		}
	}, [dispatch, attachmentKey, isFetching, isFetched, pointer]);

	useEffect(() => {
		if(!urlIsFresh && !isFetchingUrl) {
			dispatch(tryGetAttachmentURL(attachmentKey));
		}
	}, [attachmentKey, attachmentItem, dispatch, isFetchingUrl, prevAttachmentItem, urlIsFresh]);

	useEffect(() => {
		if(!dataState.isReady && isAllFetched && !wasAllFetched) {
			// pdf reader not yet loaded so we store processed annotations and begin pdf-reader loading
			setDataState({
				...dataState,
				processedAnnotations: getProcessedAnnotations(),
				isReady: true
			});
		}
		if(dataState.isReady && ((isAllFetched && !wasAllFetched) || !deepEqual(prevAnnotations, annotations))) {
			// pdf reader already loaded so just send updated annotations
			const processedAnnotations = getProcessedAnnotations();
			const allAnnotations = [...processedAnnotations, ...dataState.importedAnnotations];
			iframeRef.current.contentWindow.postMessage({
				action: 'setAnnotations',
				annotations: allAnnotations
			});
			setDataState({ ...dataState, processedAnnotations });
		}
	}, [annotations, dataState, isAllFetched, getProcessedAnnotations, prevAnnotations, wasAllFetched])

	const pdfReaderURL = useSelector(state => state.config.pdfReaderURL);
	return (
		<section className="reader-wrapper">
			<div className="header">
				<div className="left">
					<Button className="btn-link" onClick={ handleGoBack }>
						Back to Web Library
					</Button>
				</div>
				<div className="right">
					{ dataState.isReady && (
						<Button className="btn-default" onClick={ handleExport }>
							Download PDF
						</Button>
					)}
				</div>
			</div>
			{ dataState.isReady ?
				<iframe onLoad={ handleIframeLoaded } ref={ iframeRef } src={ pdfReaderURL } /> :
				<div className="spinner-wrapper">
					<Spinner />
				</div>
			}
		</section>
	);
};

export default memo(Reader);
