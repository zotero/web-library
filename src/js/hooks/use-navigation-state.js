import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { getAncestors, makeChildMap } from '../common/collection';
import { getItemsSource } from '../common/state';
import { itemsSourceLabel } from '../common/format';
import { PICKS_SINGLE_ITEM, PICKS_MULTIPLE_ITEMS } from '../constants/picker-modes';

const defaultNavState = {
	path: [],
	collectionKey: null,
	libraryKey: null,
	itemKeys: [],
	itemsSource: 'top',
	view: 'libraries'
};

const useNavigationState = (pickerMode, baseState = {}) => {
	const isFirstRender = useRef(true);
	const initialNavState = {
		...defaultNavState,
		...baseState,
		itemsSource: getItemsSource({ ...defaultNavState, ...baseState })
	};

	const libraries = useSelector(state => state.config.libraries, shallowEqual);
	const collectionKeys = useSelector(state => state.libraries[initialNavState.libraryKey]?.collections.keys) ?? [];
	const dataObjects = useSelector(state => state.libraries[initialNavState.libraryKey]?.dataObjects) ?? {};
	const collectionsDataInSelectedLibrary = Object.fromEntries(collectionKeys.map(key => [key, dataObjects[key]]));
	const childMap = makeChildMap(Object.values(collectionsDataInSelectedLibrary));

	if (isFirstRender.current) {
		// generate path from collectionKey for the initial state
		initialNavState.path = initialNavState.collectionKey ? getAncestors(initialNavState.collectionKey, childMap) : [];
		isFirstRender.current = false;
	}

	const [navState, setNavState] = useState(initialNavState);

	const handleNavigation = useCallback(({ library = null, collection = null, view = null, items = [] } = {}) => {
		let nextNavState;
		if(view === 'library') {
			nextNavState = {
				path: [],
				collectionKey: null,
				libraryKey: library,
				itemKeys: items,
				view
			};
		} else if(view === 'libraries') {
			nextNavState = {
				path: [],
				collectionKey: null,
				libraryKey: null,
				itemKeys: [],
				view
			};
		} else if(library) {
			if(collection) {
				const targetIndex = navState.path.indexOf(collection);
				var newPath;
				if(targetIndex !== -1) {
					// target collection already in path so trim the path
					newPath = navState.path.slice(0, targetIndex + 1);
				} else {
					// target collection not in the path so append
					const hasChildren = collection in childMap;
					newPath = [...navState.path];
					// Picker opens a colection if it has children or it uses "Items" node (when picking items)
					if (hasChildren || [PICKS_SINGLE_ITEM, PICKS_MULTIPLE_ITEMS].includes(pickerMode)) {
						newPath.push(collection);
					}
				}
				nextNavState = {
					path: newPath,
					libraryKey: library,
					collectionKey: collection,
					itemKeys: items,
					view
				};
			} else {
				nextNavState = {
					path: [],
					libraryKey: library,
					collectionKey: null,
					itemKeys: items,
					view
				};
			}
		}
		setNavState({ ...nextNavState, itemsSource: getItemsSource({ ...nextNavState}) });
	}, [childMap, navState.path, pickerMode]);

	const resetNavState = useCallback(() => setNavState(defaultNavState), []);

	const touchHeaderPath = useMemo(() => {
		const thp = navState.path.map(key => ({
			key,
			type: 'collection',
			label: collectionsDataInSelectedLibrary[key].name,
			path: { library: navState.libraryKey, collection: key },
		}));

		if (navState.view === 'item-list') {
			thp.push({
				key: 'items',
				type: 'items',
				path: { library: navState.libraryKey, collection: navState.collectionKey, view: 'item-list' },
				label: itemsSourceLabel(navState.itemsSource)
			});
		}

		if(navState.view !== 'libraries') {
			const libraryConfig = libraries.find(l => l.key === navState.libraryKey) || {};
			thp.unshift({
				key: navState.libraryKey,
				type: 'library',
				path: { library: navState.libraryKey, view: 'library' },
				label: libraryConfig.name
			});
		}

		thp.unshift({
			key: 'root',
			type: 'root',
			path: { view: 'libraries' },
			label: 'Libraries'
		});

		return thp;
	}, [navState, collectionsDataInSelectedLibrary, libraries]);

	return {navState, touchHeaderPath, handleNavigation, resetNavState};
}


export { useNavigationState };
