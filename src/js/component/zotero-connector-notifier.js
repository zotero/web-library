import React, { useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';


const ZoteroConnectorNotifier = () => {
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKeys = useSelector(state => state.current.itemKeys, shallowEqual);
	const tags = useSelector(state => state.current.tags, shallowEqual);

	useEffect(() => {
		// add timeout so that the event is fired after rendering is complete
		setTimeout(() => {
			document.dispatchEvent(new Event('ZoteroItemUpdated', {
				bubbles: true,
				cancelable: true
			}))
		});
	}, [collectionKey, itemKeys, libraryKey, tags]);

	return null;
}

export default ZoteroConnectorNotifier;
