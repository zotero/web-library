import { forwardRef, memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { triggerSearchMode } from '../actions';

const SearchBackdrop = forwardRef((_props, ref) => {
	const dispatch = useDispatch();

	const handleClick = useCallback(() => {
		dispatch(triggerSearchMode(false));
	}, [dispatch]);

	return <div ref={ ref } onClick={ handleClick } className="search-backdrop" />;
});

SearchBackdrop.displayName = 'SearchBackdrop';

export default memo(SearchBackdrop);
