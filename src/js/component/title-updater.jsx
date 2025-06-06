import { useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { unescapeHTML } from '../utils';

const TitleUpdater = () => {
	const libraryKey = useSelector(state => state.current.libraryKey);
	const libraryName = useSelector(state => (state.config.libraries.find(l => l.key === libraryKey) || {}).name);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const collectionName = useSelector(state => state.libraries?.dataObjects?.[collectionKey]?.name);
	const selectedItemKey = useSelector(state => state.current.itemKey);
	const selectedItemsKeys = useSelector(state => state.current.itemKeys, shallowEqual);
	const item = useSelector(state => state.libraries[libraryKey]?.dataObjects?.[selectedItemKey]);
	const attachmentItem = useSelector(state => state.libraries[libraryKey]?.dataObjects?.[attachmentKey]);

	const debouncedNotify = useDebouncedCallback(() => {
		var title = ['Zotero'];

		if(libraryName) {
			title.push(libraryName);
		}

		switch(itemsSource) {
			case 'query':
				title.push('Search Results');
			break;
			case 'trash':
				title.push('Trash');
			break;
			case 'publications':
				title.push('My Publications');
			break;
			case 'collection':
				if(collectionName) {
					title.push(collectionName);
				}
			break;
		}

		if(item) {
			title.push((item[Symbol.for('derived')] || {}).title);
		} else if(selectedItemsKeys.length > 0 && !attachmentItem) {
			title.push(`${selectedItemsKeys.length} items selected`);
		}

		if(attachmentItem && (attachmentItem[Symbol.for('derived')] || {}).title) {
			title.push((attachmentItem[Symbol.for('derived')]).title);
		}

		title.reverse();

		document.title = unescapeHTML(title.join(' | '));
	}, 50);

	useEffect(() => { debouncedNotify(); } , [
		attachmentKey, attachmentItem, debouncedNotify, libraryName, itemsSource, item, selectedItemsKeys
	]);

	return null;
}

export default TitleUpdater;
