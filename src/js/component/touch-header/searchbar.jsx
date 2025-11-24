import PropTypes from 'prop-types';
import { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { Button } from 'web-common/components';

import MainSearch from '../../component/main-search';
import { navigateExitSearch, triggerSearchMode, } from '../../actions';

export const MainSearchBar = memo(() => {
	const dispatch = useDispatch();
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isViewThatShowsSearchBar = useSelector(state =>
		((state.current.view === 'item-details' && state.current.itemsSource !== 'query') || state.current.view !== 'item-details')
	);

	const handleCancel = useCallback(() => {
		dispatch(triggerSearchMode(false));
		dispatch(navigateExitSearch());
	}, [dispatch]);

	return <SearchBar
		isActive={ isSearchMode && isViewThatShowsSearchBar }
		onCancel={ handleCancel }
	/>
});

MainSearchBar.displayName = 'MainSearchBar';

const SearchBar = ({ isActive, onCancel, search }) => {
	const searchBarRef = useRef(null);

	return (
		<CSSTransition
			in={ isActive }
			timeout={ 250 }
			classNames="fade"
			unmountOnExit
			nodeRef={ searchBarRef }
		>
			<div ref={ searchBarRef } className="searchbar">
				{ search ? search : <MainSearch autoFocus /> }
				<Button onClick={ onCancel } className="btn-link">
					Cancel
				</Button>
			</div>
		</CSSTransition>
	);
}

SearchBar.propTypes = {
	isActive: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
	search: PropTypes.node,
}

export default memo(SearchBar);
