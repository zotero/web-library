import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { PREFERENCES_LOAD } from '../constants/actions';
import { sortItems } from '../actions';
import { usePrevious } from 'web-common/hooks';
import { preferences as defaultPreferences } from '../constants/defaults';
import { localStorageWrapper } from '../utils';


const PreferencesObserver = () => {
	const dispatch = useDispatch();
	const sortField = useSelector(state => state.preferences.columns.find(c => c.sort)?.field ?? null);
	const sortDirection = useSelector(state => state.preferences.columns.find(c => c.sort)?.sort ?? null);
	const prevSortField = usePrevious(sortField);
	const prevSortDirection = usePrevious(sortDirection);

	const handlePrefChange = useCallback(() => {
		try {
			const newPrefs = JSON.parse(localStorageWrapper.getItem('zotero-web-library-prefs'));
			const preferences = { ...defaultPreferences, ...newPrefs };

			dispatch({
				type: PREFERENCES_LOAD,
				isRemote: true,
				preferences
			});
		} catch (e) {
			// ignore
		}
	}, [dispatch]);

	// Trigger sort when sortBy or sortDirection changes in preferences
	useEffect(() => {
		if (typeof prevSortField !== 'undefined' && typeof sortDirection !== 'undefined' && (sortField !== prevSortField || sortDirection !== prevSortDirection)) {
			dispatch(sortItems(
				sortField, sortDirection.toLowerCase()
			));
		}

	}, [sortField, sortDirection, prevSortField, prevSortDirection, dispatch]);

	useEffect(() => {
		window.addEventListener("storage", handlePrefChange);
		return () => {
			window.removeEventListener("storage", () => handlePrefChange);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}


export default PreferencesObserver;
