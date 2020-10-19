import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { triggerSearchMode } from '../actions';

const SearchBackdrop = () => {
	const dispatch = useDispatch();

	const handleClick = useCallback(() => {
		dispatch(triggerSearchMode(false));
	}, [dispatch]);

	return <div onClick={ handleClick } className="search-backdrop" />;
}

export default memo(SearchBackdrop);
