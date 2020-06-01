import { useCallback, useMemo, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { makeChildMap } from '../common/collection';
import { get } from '../utils';

const defaultNavState = {
	path: [],
	collectionKey: null,
	libraryKey: null,
	view: 'libraries'
};

const useNavigationState = () => {
	const [navState, setNavState] = useState(defaultNavState);
	const libraries = useSelector(state => state.config.libraries, shallowEqual);
	const collectionsDataInSelectedLibrary = useSelector(
		state => get(state, ['libraries', navState.libraryKey, 'collections', 'data'], []), shallowEqual
	);

	const handleNavigation = useCallback(({ library = null, collection = null, view = null } = {}) => {
		console.log('handleNavigation', { library, collection, view });
		if(view === 'library') {
			setNavState({
				path: [],
				collectionKey: null,
				libraryKey: library,
				view
			});
		} else if(view === 'libraries') {
			setNavState({
				path: [],
				collectionKey: null,
				libraryKey: null,
				view
			});
		} else if(library) {
			if(collection) {
				const targetIndex = navState.path.indexOf(collection);
				console.log({ curPath: navState.path, collection, targetIndex });
				var newPath;
				if(targetIndex !== -1) {
					// target collection already in path so trim the path
					newPath = navState.path.slice(0, targetIndex + 1);
				} else {
					// target collection not in the path so append
					const childMap = makeChildMap(Object.values(collectionsDataInSelectedLibrary));
					const hasChildren = collection in childMap;
					newPath = [...navState.path];
					if(hasChildren) {
						newPath.push(collection);
					}
				}
				setNavState({
					path: newPath,
					libraryKey: library,
					collectionKey: collection,
					view: 'collection'
				});
			} else {
				setNavState({
					path: [],
					libraryKey: library,
					collectionKey: null,
					view
				});
			}
		}
	}, [collectionsDataInSelectedLibrary, navState.path]);

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

	return {navState, touchHeaderPath, handleNavigation, resetNavState};
}


export { useNavigationState };
