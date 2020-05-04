import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { remoteLibraryUpdate } from '../actions';
import { getLibraryKeyFromTopic } from '../utils';

const ZoteroStreamingClient = () => {
	const dispatch = useDispatch();
	const apiKey = useSelector(state => state.config.apiKey);
	const ws = useRef(null);

	const handleMessage = useCallback(ev => {
		try {
			const message = JSON.parse(ev.data);

			if(message.event === 'connected') {
				console.log("WS connected");
				ws.current.send(JSON.stringify({
					'action': 'createSubscriptions',
					'subscriptions': [{ apiKey }],
				}));
			} else if(message.event === 'subscriptionsCreated') {
				console.log('WS subscriptions created');
			} else if(message.event === 'topicUpdated') {
				const libraryKey = getLibraryKeyFromTopic(message.topic);
				if(libraryKey) {
					dispatch(remoteLibraryUpdate(libraryKey, message.version))
				}
			}
		} catch(c) {
			// console.error(c);
			//
		}
	}, [dispatch])

	const handleOpen = useCallback(ev => {

	}, [])

	const handleClose = useCallback(ev => {

	}, [])

	const handleError = useCallback(ev => {

	}, [])

	const handleUnload = useCallback(ev => {

	}, [])

	useEffect(() => {
		console.log('WS setup');
		ws.current = new WebSocket(`wss://stream.zotero.org/`);

		ws.current.onmessage = handleMessage;
		ws.current.onopen = handleOpen;
		ws.current.onerror = handleError;
		ws.current.onclose = handleClose;

		document.addEventListener('unload', handleUnload);

		return () => {
			console.log('WS teardown');
			document.removeEventListener('unload', handleUnload);
			ws.current.close();
		}
	}, []);
	return null;
}


export default ZoteroStreamingClient;
