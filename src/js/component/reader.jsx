import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchChildItems, fetchItemDetails, navigate, tryGetAttachmentURL } from '../actions';
import { useFetchingState, usePrevious } from '../hooks';
import Button from './ui/button';
import Spinner from './ui/spinner';

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

	const handleIframeLoaded = useCallback(() => {
		iframeRef.current.contentWindow.postMessage({ annotations, url });
	}, [annotations, url])

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
				<Spinner />
			}
		</section>
	);
};

export default memo(Reader);
