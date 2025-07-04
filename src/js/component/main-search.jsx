import { memo, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';

import { navigate, resetQuery, toggleAdvancedSearch } from '../actions';
import Search from './search';


const MainSearch = props => {
	const dispatch = useDispatch();
	const search = useSelector(state => state.current.search);
	const searchState = useSelector(state => state.current.searchState);
	const qmode = useSelector(state => state.current.qmode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const prevItemsSource = usePrevious(itemsSource);
	const collection = useSelector(state => state.current.collectionKey)
	const prevCollection = usePrevious(collection);
	const isAdvancedSearch = useSelector(state => state.current.isAdvancedSearch);
	const ref = useRef(null);

	const handleSearch = useCallback(searchNavObject => {
		dispatch(navigate((searchNavObject)));
	}, [dispatch]);

	const handleToggleAdvancedSearch = useCallback((toggleValue) => {
		dispatch(toggleAdvancedSearch(toggleValue));
	}, [dispatch]);

	const handleResetQuery = useCallback(() => {
		dispatch(resetQuery());
	}, [dispatch]);

	useEffect(() => {
		if (!prevItemsSource) {
			return;
		}
		if (itemsSource !== prevItemsSource && itemsSource !== 'query') {
			ref.current.reset();
		}
	}, [itemsSource, prevItemsSource]);

	useEffect(() => {
		if (!prevCollection) {
			return;
		}
		if (collection !== prevCollection) {
			ref.current.reset();
		}
	}, [collection, prevCollection]);

	return <Search
		isAdvancedSearch={ isAdvancedSearch }
		onResetQuery={ handleResetQuery }
		onSearch={ handleSearch }
		onToggleAdvancedSearch={ handleToggleAdvancedSearch }
		qmode={ qmode }
		ref={ ref }
		search={ search }
		searchState={ searchState }
		{ ...props }
	/>;
}

export default memo(MainSearch);
