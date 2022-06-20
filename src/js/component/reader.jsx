import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveAs } from 'file-saver';

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
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const attachmentItem = useSelector(state => state.libraries[libraryKey]?.items[attachmentKey]);
	const isFetchingUrl = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.isFetching ?? false);
	const url = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.url);
	const timestamp = useSelector(state => state.libraries[libraryKey]?.attachmentsUrl[attachmentKey]?.timestamp ?? 0);
	const allItems = useSelector(state => state.libraries[libraryKey].items);
	const prevAttachmentItem = usePrevious(attachmentItem);

	const { isFetching, isFetched, pointer, keys } = useFetchingState(
		['libraries', libraryKey, 'itemsByParent', attachmentKey]
	);

	const annotations = (isFetched && keys ? keys : [])
		.map(childItemKey => allItems[childItemKey])
		.filter(item => !item.deleted && item.itemType === 'annotation');

	const urlIsFresh = !!(url && (Date.now() - timestamp) < 60000);
	const isReady = isFetched && urlIsFresh;

	const handleGoBack = useCallback(() => {
		dispatch(navigate({ attachmentKey, view: 'item-details' }));
	}, [attachmentKey, dispatch]);

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
				const importedAnnotations = await pdfWorker.import(message.buf);
				const allAnnotations = [...annotations, ...importedAnnotations];
				const jsonAnnotations = allAnnotations.map(x => annotationItemToJSON(x));
				iframeRef.current.contentWindow.postMessage({
					action: 'setAnnotations',
					annotations: jsonAnnotations
				});
				return;
			}
			case 'save': {
				// Currently, this can only be triggered by window.save() in pdf-reader iframe
				// TODO: Add a button or a key combination i.e. Cmd-s to trigger this action
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
	}, [annotations, attachmentItem]);

	const handleIframeLoaded = useCallback(() => {
		iframeRef.current.contentWindow.addEventListener('message', handleIframeMessage);
		// Transform Zotero annotation items into pdf-reader compatible format
		const jsonAnnotations = [];
		for (const annotation of annotations) {
			try {
				jsonAnnotations.push(annotationItemToJSON(annotation));
			} catch (e) {
				dispatch({
					type: ERROR_PROCESSING_ANNOTATIONS,
					error: "Failed to process annotations"
				});
				console.error(e);
				continue;
			}
		}
		iframeRef.current.contentWindow.postMessage({
			action: 'open',
			url,
			annotations: jsonAnnotations,
			state: null, // Do we want to save PDF reader view state?
			location: null, // Navigate to specific PDF part when opening it
			readOnly: true,
			authorName: 'n/a', // TODO: item.library.libraryType === 'group' ? Zotero.Users.getCurrentName() : '',
			sidebarWidth: 240, // Save sidebar width?
			sidebarOpen: true, // Save sidebar open/close state?
			rtl: false // TODO: ?
		});
	}, [annotations, dispatch, handleIframeMessage, url])

	useEffect(() => {
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
		if((!prevAttachmentItem && attachmentItem) && !urlIsFresh && !isFetchingUrl) {
			dispatch(tryGetAttachmentURL(attachmentKey));
		}
	}, [attachmentKey, attachmentItem, dispatch, isFetchingUrl, prevAttachmentItem, urlIsFresh]);

	const pdfReaderURL = useSelector(state => state.config.pdfReaderURL);
	return (
		<section className="reader-wrapper">
			<div className="header">
				<Button className="btn-link" onClick={ handleGoBack }>
					Back to Web Library
				</Button>
			</div>
			{ isReady ?
				<iframe onLoad={ handleIframeLoaded } ref={ iframeRef } src={ pdfReaderURL } /> :
				<div className="spinner-wrapper">
					<Spinner />
				</div>
			}
		</section>
	);
};

export default memo(Reader);
