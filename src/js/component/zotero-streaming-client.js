import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { remoteLibraryUpdate } from '../actions';
import { getLibraryKeyFromTopic } from '../utils';

// Streaming client configures WS connection once, based on config
// that never changes. There is no need to recreate handle* or connect
// methods at any point therefore exhaustive-deps rule can be disabled
/* eslint-disable react-hooks/exhaustive-deps */

const ZoteroStreamingClient = () => {
	const dispatch = useDispatch();
	const apiKey = useSelector(state => state.config.apiKey);
	const streamingApiUrl = useSelector(state => state.config.streamingApiUrl);
	const externalLibraries = useSelector(state => state.config.libraries).filter(l => l.isExternal);
	const ws = useRef(null);
	const isTearDown = useRef(false);

	const handleMessage = useCallback(ev => {
		try {
			const message = JSON.parse(ev.data);
			if(message.event === 'connected') {
				const subscriptions = [];
				if(apiKey) {
					subscriptions.push({ apiKey});
				}

				if(externalLibraries.length > 0) {
					subscriptions.push({
						topics: externalLibraries.map(l => `/${l.isGroupLibrary ? 'groups' : 'users'}/${l.id}`)
					});
				}
				ws.current.send(JSON.stringify({'action': 'createSubscriptions', subscriptions }));
			} else if(message.event === 'subscriptionsCreated') {
				//
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
	}, [])

	const handleClose = useCallback(() => {
		if(!isTearDown.current) {
			connect();
		}
	}, []);

	const handleError = useCallback(() => {
	}, []);

	const connect = useCallback(() => {
		try {
			ws.current = new WebSocket(streamingApiUrl);
			ws.current.onmessage = handleMessage;
			ws.current.onerror = handleError;
			ws.current.onclose = handleClose;
		} catch(e) {
			console.error('Failed to estabilish connection to the streaming API.');
		}
	}, [handleClose, handleError, handleMessage, streamingApiUrl]);

	useEffect(() => {
		if(ws.current === null) {
			connect();
			return () => {
				isTearDown.current = true;
				ws.current.close();
			}
		}
	}, []);
	return null;
}


export default ZoteroStreamingClient;
