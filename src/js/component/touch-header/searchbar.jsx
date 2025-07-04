import { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { Button } from 'web-common/components';

import MainSearch from '../../component/main-search';
import { navigateExitSearch, triggerSearchMode, } from '../../actions';

const SearchBar = () => {
	const dispatch = useDispatch();
	const searchBarRef = useRef(null);
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
			nodeRef={ searchBarRef }
		>
			<div ref={ searchBarRef } className="searchbar">
				<MainSearch autoFocus />
				<Button onClick={ handleCancelSearchClick } className="btn-link">
					Cancel
				</Button>
			</div>
		</CSSTransition>
	);
}

export default memo(SearchBar);
