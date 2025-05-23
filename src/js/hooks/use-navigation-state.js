import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { getAncestors, makeChildMap } from '../common/collection';
import { getItemsSource } from '../common/state';

const defaultNavState = {
	path: [],
	collectionKey: null,
	libraryKey: null,
	itemKeys: [],
	itemsSource: 'top',
	view: 'libraries'
};

const useNavigationState = (baseState = {}) => {
	const [navState, setNavState] = useState({
		...defaultNavState,
		...baseState,
		itemsSource: getItemsSource({ ...defaultNavState, ...baseState })
	});
	const libraries = useSelector(state => state.config.libraries, shallowEqual);

	const collectionKeys = useSelector(state => state.libraries[navState.libraryKey]?.collections.keys) ?? [];
	const dataObjects = useSelector(state => state.libraries[navState.libraryKey]?.dataObjects) ?? {};
	const collectionsDataInSelectedLibrary = Object.fromEntries(collectionKeys.map(key => [key, dataObjects[key]]));
	const childMap = makeChildMap(Object.values(collectionsDataInSelectedLibrary));

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
					if(hasChildren) {
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
	}, [childMap, navState.path]);

	const resetNavState = useCallback(() => setNavState(defaultNavState), []);

	const touchHeaderPath = useMemo(() => {
		const thp = navState.path.map(key => ({
			key,
			type: 'collection',
			label: collectionsDataInSelectedLibrary[key].name,
			path: { library: navState.libraryKey, collection: key },
		}));

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
	}, [collectionsDataInSelectedLibrary, libraries, navState.path, navState.view, navState.libraryKey]);

	// generate path from collectionKey for the initial state
	useEffect(() => {
		if (baseState.collectionKey) {
			let path = getAncestors(baseState.collectionKey, childMap);
			setNavState(prevState => ({ ...prevState, path }));
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return {navState, touchHeaderPath, handleNavigation, resetNavState};
}


export { useNavigationState };
