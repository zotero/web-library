import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { remoteLibraryUpdate } from '../actions';
import { getLibraryKeyFromTopic } from '../utils';

// 10 seconds timeout for subscription creation, after that connection is reset
const SUBSCRIPTION_TIMEOUT = 10000;

// same as intervals in Zotero.Streamer_Module
// https://github.com/zotero/zotero/blob/182bfb9a38bf4046fa1eb33f8a46dddcf2bade16/chrome/content/zotero/xpcom/streamer.js#L262
const intervals = [
	2, 5, 10, 15, 30, // first minute
	60, 60, 60, 60, // every minute for 4 minutes
	120, 120, 120, 120, // every 2 minutes for 8 minutes
	300, 300, // every 5 minutes for 10 minutes
	600, // 10 minutes
	1200, // 20 minutes
	1800, 1800, // 30 minutes for 1 hour
	3600, 3600, 3600, // every hour for 3 hours
	14400, 14400, 14400, // every 4 hours for 12 hours
	86400 // 1 day
].map(i => i * 1000);

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
	const retryTimeout = useRef(null);
	const retryIntervalIndex = useRef(0);

	const closeUnconfirmedSubscription = useCallback(() => {
		console.warn(`Failed to confirm subscription creation within ${SUBSCRIPTION_TIMEOUT / 1000} seconds. Closing connection.`);
		ws.current.close();
	}, []);

	const createSubscriptions = useCallback(() => {
		const subscriptions = [];
		if (apiKey) {
			subscriptions.push({ apiKey });
		}

		if (externalLibraries.length > 0) {
			subscriptions.push({
				topics: externalLibraries.map(l => `/${l.isGroupLibrary ? 'groups' : 'users'}/${l.id}`)
			});
		}
		ws.current.send(JSON.stringify({ 'action': 'createSubscriptions', subscriptions }));
		retryTimeout.current = setTimeout(closeUnconfirmedSubscription, SUBSCRIPTION_TIMEOUT);
	}, [apiKey, externalLibraries]);

	const handleMessage = useCallback(ev => {
		try {
			const message = JSON.parse(ev.data);
			if(message.event === 'connected') {
				createSubscriptions();
			} else if(message.event === 'subscriptionsCreated') {
				if(retryTimeout.current) {
					clearTimeout(retryTimeout.current);
					retryIntervalIndex.current = 0;
				}
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
			clearTimeout(retryTimeout.current);
			console.warn(`Connection to the streaming API was closed. Retrying in ${intervals[retryIntervalIndex.current] / 1000} seconds`);
			setTimeout(connect, intervals[retryIntervalIndex.current]);
			retryIntervalIndex.current = Math.min(retryIntervalIndex.current + 1, intervals.length - 1);
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
			console.warn(`Failed to estabilish connection to the streaming API. Retrying in ${intervals[retryIntervalIndex.current] / 1000} seconds`);
			setTimeout(connect, intervals[retryIntervalIndex.current]);
			retryIntervalIndex.current = Math.min(retryIntervalIndex.current + 1, intervals.length - 1);
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
