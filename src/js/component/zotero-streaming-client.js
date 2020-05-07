import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { remoteLibraryUpdate } from '../actions';
import { getLibraryKeyFromTopic } from '../utils';

const ZoteroStreamingClient = () => {
	const dispatch = useDispatch();
	const apiKey = useSelector(state => state.config.apiKey);
	const ws = useRef(null);
	const isTearDown = useRef(false);

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

	const handleClose = useCallback(ev => {
		if(!isTearDown.current) {
			connect();
		}
		console.log('WS close', ev);
	}, []);

	const handleError = useCallback(ev => {
		console.log('WS error', ev);
	}, []);

	const connect = useCallback(() => {
		console.log('WS setup');
		ws.current = new WebSocket(`wss://stream.zotero.org/`);
		ws.current.onmessage = handleMessage;
		ws.current.onerror = handleError;
		ws.current.onclose = handleClose;
	}, []);

	useEffect(() => {
		connect();
		return () => {
			console.log('WS teardown');
			isTearDown.current = true;
			ws.current.close();
		}
	}, []);
	return null;
}


export default ZoteroStreamingClient;
