import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { remoteLibraryUpdate } from '../actions';
import { getLibraryKeyFromTopic } from '../utils';

const ZoteroStreamingClient = () => {
	const dispatch = useDispatch();
	const apiKey = useSelector(state => state.config.apiKey);
	const externalLibraries = useSelector(state => state.config.libraries.filter(l => l.isExternal));
	const ws = useRef(null);
	const isTearDown = useRef(false);

	const handleMessage = useCallback(ev => {
		try {
			const message = JSON.parse(ev.data);

			if(message.event === 'connected') {
				ws.current.send(JSON.stringify({
					'action': 'createSubscriptions',
					'subscriptions': [
						{ apiKey },
						{ topics: externalLibraries.map(l => `/${l.isGroupLibrary ? 'groups' : 'users'}/${l.id}`) }
					],
				}));
			} else if(message.event === 'subscriptionsCreated') {
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
	}, []);

	const handleError = useCallback(ev => {
	}, []);

	const connect = useCallback(() => {
		ws.current = new WebSocket(`wss://stream.zotero.org/`);
		ws.current.onmessage = handleMessage;
		ws.current.onerror = handleError;
		ws.current.onclose = handleClose;
	}, []);

	useEffect(() => {
		connect();
		return () => {
			isTearDown.current = true;
			ws.current.close();
		}
	}, []);
	return null;
}


export default ZoteroStreamingClient;
