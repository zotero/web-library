'use strict';

const isCollectionSelected = state => {
	return state.library && 
		state.collections[state.library.libraryString] && 
		'collection' in state.router.params;
};

const getCollections = state => {
	return state.library &&
		state.collections[state.library.libraryString] ? 
			state.collections[state.library.libraryString].collections : [];
};

const getRootLevelCollections = state => {
	return state.collections[state.library.libraryString].collections.filter(
		c => c.nestingDepth === 1
	);
};


const getPathFromState = state => {
	if(isCollectionSelected(state)) {
		let selectedCollectionKey = state.router.params.collection;
		let collections = getRootLevelCollections(state);
		return mapTreePath(selectedCollectionKey, collections, []);
	}
	return [];
};

//@TODO: memoize
const mapTreePath = (selectedKey, collections, curPath) => {
	for(let col of collections) {
		if(col.key === selectedKey) {
			return curPath.concat(col.key);
		} else if(col.children.length) {
			let maybePath = mapTreePath(selectedKey, col.children, curPath.concat(col.key));
			if(maybePath.includes(selectedKey)) {
				return maybePath;
			}
		}
	}

	return curPath;
};

//@TODO: memoize
const getCurrentViewFromState = state => {
	if(isCollectionSelected(state)) {
		let selectedCollectionKey = state.router.params.collection;
		let collections = state.collections[state.library.libraryString].collections;
		let selectedCollection = collections.find(c => c.key === selectedCollectionKey);
		if('item' in state.router.params && state.items[selectedCollectionKey] && state.items[selectedCollectionKey].items) {
			let selectedItemKey = state.router.params.item;
			let items = state.items[selectedCollectionKey].items;
			let selectedItem = items.find(i => i.key === selectedItemKey);
			if(selectedItem) {
				return 'item-details';
			}
		}

		if(selectedCollection && !selectedCollection.hasChildren) {
			return 'item-list';
		}
	}

	return 'library';
};

export default {
	isCollectionSelected,
	getCollections,
	getRootLevelCollections,
	getPathFromState,
	getCurrentViewFromState
};