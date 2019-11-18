import { useSelector, shallowEqual } from 'react-redux';
import { get } from '../utils';

const useFetchingState = path => {
	const { isFetching, keys, pointer, totalResults } = useSelector(state => get(state, path, {}), shallowEqual);
	const hasMoreItems = totalResults > 0 && (typeof(pointer) === 'undefined' || pointer < totalResults);
	const hasChecked = typeof(totalResults) !== 'undefined';
	const isFetched = hasChecked && !isFetching && !hasMoreItems;

	return { isFetching, isFetched, keys, hasChecked, hasMoreItems, pointer };
};

export { useFetchingState };
