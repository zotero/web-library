import React, { useEffect } from 'react';
import { useSelector, shallowCompare } from 'react-redux';


const ZoteroConnectorNotifier = () => {
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKeys = useSelector(state => state.current.itemKeys, shallowCompare);
	const tags = useSelector(state => state.current.tags, shallowCompare);

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
