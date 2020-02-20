import React, { useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useSourceData } from '../hooks';
import { get } from '../utils';


const mapItemKeysToTitles = (keys, state) => {
	const libraryKey = state.current.libraryKey;

	if(!(libraryKey in state.libraries)) {
		return {};
	}

	return keys.reduce((acc, ik) => {
		if(!(ik in state.libraries[libraryKey].items)) {
			return acc;
		}
		const title = state.libraries[libraryKey].items[ik][Symbol.for('derived')].title;
		acc[ik] = title;

		return acc;
	}, {});
}


const ZoteroConnectorNotifier = () => {
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const selectedItemKey = useSelector(state => state.current.itemKey);
	const selectedItemsKeys = useSelector(state => state.current.itemKeys, shallowEqual);
	const tags = useSelector(state => state.current.tags, shallowEqual);
	const { keys: itemKeysCurrentSource } = useSourceData();
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', selectedItemKey], null));
	const itemTitles = useSelector(state => {
		if(selectedItemsKeys && selectedItemsKeys.length > 0) {
			return mapItemKeysToTitles(selectedItemsKeys, state);
		}

		if(itemKeysCurrentSource) {
			// no key selected, offer all items we are aware of in current view
			return mapItemKeysToTitles(itemKeysCurrentSource, state);
		}

		return {};
	});

	const [debouncedNotify] = useDebouncedCallback(() => {
		document.dispatchEvent(new Event('ZoteroItemUpdated', {
			bubbles: true,
			cancelable: true
		}));
	}, 250);

	useEffect(debouncedNotify, [collectionKey, itemTitles, libraryKey, tags]);

	return (
		<React.Fragment>
		<script id="translator-items-list" type="application/vnd.zotero.data+json">
			{ JSON.stringify(itemTitles) }
		</script>
		{ item && (
			<script id="translator-current-item" key={ item.key } type="application/vnd.zotero.data+json">
				{ JSON.stringify(item) }
			</script>
		) }
		</React.Fragment>
	);
}

export default ZoteroConnectorNotifier;
