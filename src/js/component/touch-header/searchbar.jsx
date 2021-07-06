import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';

import Search from '../../component/search';
import Button from '../ui/button';
import { ItemActionsTouch } from '../item/actions'
import { navigateExitSearch, triggerSearchMode, } from '../../actions';

const SearchBar = () => {
	const dispatch = useDispatch();
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isViewThatShowsSearchBar = useSelector(state =>
		((state.current.view === 'item-details' && state.current.itemsSource !== 'query') || state.current.view !== 'item-details')
	);

	const handleCancelSearchClick = useCallback(() => {
		dispatch(triggerSearchMode(false));
		dispatch(navigateExitSearch());
	}, [dispatch])

	return (
		<CSSTransition
			in={ isSearchMode && isViewThatShowsSearchBar }
			timeout={ 250 }
			classNames="fade"
			unmountOnExit
		>
			<div className="searchbar">
				<Search autoFocus />
				<Button onClick={ handleCancelSearchClick } className="btn-link">
					Cancel
				</Button>
				<ItemActionsTouch />
			</div>
		</CSSTransition>
	);
}

export default memo(SearchBar);
