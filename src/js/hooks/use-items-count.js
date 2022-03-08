import { useSelector } from 'react-redux';
import { get } from '../utils';

const useItemsCount = () => {
	return useSelector(state => {
		const { collectionKey, libraryKey, itemsSource } = state.current;
		switch(itemsSource) {
			case 'query':
				return state.query.totalResults || null;
			case 'top':
				return get(state, ['libraries', libraryKey, 'itemsTop', 'totalResults'], null);
			case 'trash':
				return get(state, ['libraries', libraryKey, 'itemsTrash', 'totalResults'], null);
			case 'collection':
				return get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey, 'totalResults'], null)
		}
	});
};

export { useItemsCount };
