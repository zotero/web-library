import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import UncontrolledDropdown from 'reactstrap/es/UncontrolledDropdown';
import DropdownToggle from 'reactstrap/es/DropdownToggle';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import DropdownItem from 'reactstrap/es/DropdownItem';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Button from './ui/button';
import Icon from './ui/icon';
import { navigate, resetQuery, toggleAdvancedSearch } from '../actions';
import { noop } from '../utils';
import { usePrevious } from '../hooks';

const SEARCH_INPUT_DEBOUNCE_DELAY = 300; //ms
const modes = {
	titleCreatorYear: "Title, Creator, Year",
	everything: "Title, Creator, Year + Full-Text Content"
};

const SearchDropdown = memo(({ modes, onKeyDown, onSelectMode }) => (
	<UncontrolledDropdown
		className="dropdown"
	>
		<DropdownToggle
			color={ null }
			className="btn-icon dropdown-toggle"
			tabIndex={ -2 }
			onKeyDown={ onKeyDown }
		>
			<Icon type={ '24/search-options' } width="24" height="24" />
		</DropdownToggle>
		<DropdownMenu>
			<DropdownItem
				data-qmode="titleCreatorYear"
				onClick={ onSelectMode }
			>
				{ modes['titleCreatorYear'] }
			</DropdownItem>
			<DropdownItem
				data-qmode="everything"
				onClick={ onSelectMode }
			>
				{ modes['everything'] }
			</DropdownItem>
		</DropdownMenu>
	</UncontrolledDropdown>
));

SearchDropdown.displayName = 'SearchDropdown';

SearchDropdown.propTypes = {
	modes: PropTypes.object,
	onSelectMode: PropTypes.func,
	onKeyDown: PropTypes.func,
};

const Search = props => {
	const { onFocusNext = noop, onFocusPrev = noop, autoFocus, registerAutoFocus = noop } = props;
	const dispatch = useDispatch();
	const search = useSelector(state => state.current.search);
	const searchState = useSelector(state => state.current.searchState);
	const qmode = useSelector(state => state.current.qmode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const prevItemsSource = usePrevious(itemsSource);
	const collection = useSelector(state => state.current.collectionKey)
	const prevCollection = usePrevious(collection);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isAdvancedSearch = useSelector(state => state.current.isAdvancedSearch);

	const inputRef = useRef(null);

	// on single-column devices allow re-querying after initial mount because search input is being
	// unmounted when navigating into an item and remounted back when on the list
	const hasBlurredSinceLastSearch = useRef(isSingleColumn);

	const [searchValue, setSearchValue] = useState(search);
	const [qmodeValue, setQmodeValue] = useState(qmode || 'titleCreatorYear');

	const performSearch = useCallback((newSearchValue, newQmodeValue) => {
		var view, items, attachmentKey, noteKey;

		if(!newSearchValue && isSingleColumn) {
			// if search is empty, on mobiles, go back to the view that triggered the search
			view = searchState.triggerView ?
				searchState.triggerView === 'item-details' ?
					searchState.triggerItem ? 'item-details' : 'item-list'
					: searchState.triggerView
				: view
			items = searchState.triggerView === 'item-details' && searchState.triggerItem ?
				searchState.triggerItem : null;
			attachmentKey = searchState.attachmentKey || null;
			noteKey = searchState.noteKey || null;
		}
		dispatch(navigate(({ attachmentKey, view, noteKey, items, search: newSearchValue, qmode: newQmodeValue })));
	}, [dispatch, isSingleColumn, searchState]);

	const performSearchDebounce =
		useDebouncedCallback(performSearch, SEARCH_INPUT_DEBOUNCE_DELAY);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		setSearchValue(newValue);
		hasBlurredSinceLastSearch.current = false;

		if(newValue.includes('"') && !isAdvancedSearch && !isTouchOrSmall) {
			dispatch(toggleAdvancedSearch(true));
		} else if(isAdvancedSearch && newValue.length === 0) {
			dispatch(toggleAdvancedSearch(false));
		}

		if(isTouchOrSmall || (!isAdvancedSearch && !newValue.includes('"'))) {
			performSearchDebounce(newValue, qmodeValue);
		}
	}, [dispatch, isTouchOrSmall, isAdvancedSearch, performSearchDebounce, qmodeValue]);

	const handleSearchClear = useCallback(() => {
		performSearchDebounce.cancel();
		setSearchValue('');
		dispatch(toggleAdvancedSearch(false));
		performSearchDebounce('', qmodeValue);
		inputRef.current.focus();
	}, [dispatch, performSearchDebounce, qmodeValue]);

	const handleSelectMode = useCallback(ev => {
		setQmodeValue(ev.currentTarget.dataset.qmode);
		if(searchValue.length > 0) {
			performSearchDebounce(searchValue, ev.currentTarget.dataset.qmode);
		}
	}, [performSearchDebounce, searchValue]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			if(ev.target === inputRef.current) {
				const { selectionStart, selectionEnd, value } = ev.target;
				if(selectionStart === selectionEnd && selectionStart === value.length) {
					onFocusNext(ev);
				}
			} else {
				onFocusNext(ev);
			}
		} else if(ev.key === 'ArrowLeft') {
			if(ev.target === inputRef.current) {
				const { selectionStart, selectionEnd } = ev.target;
				if(selectionStart === selectionEnd && selectionStart === 0) {
					onFocusPrev(ev);
				}
			} else {
				onFocusPrev(ev);
			}
		} else if(ev.key === "Enter") {
			// In certain cases user might want to force search again, with the same query,
			// see https://github.com/zotero/web-library/issues/408#issuecomment-704819064
			// we allow this, but only if search input has been blurred since last search
			if(ev.target === inputRef.current && (hasBlurredSinceLastSearch.current || isAdvancedSearch)) {
				if(performSearchDebounce.isPending()) {
					performSearchDebounce.flush();
				}
				dispatch(resetQuery());
				dispatch(toggleAdvancedSearch(false));
				performSearch(searchValue, qmodeValue);
				hasBlurredSinceLastSearch.current = false;
			}
		}
	}, [isAdvancedSearch, dispatch, onFocusNext, onFocusPrev, performSearch, performSearchDebounce, searchValue, qmodeValue]);

	const handleBlur = useCallback(() => {
		hasBlurredSinceLastSearch.current = true;
	}, []);

	useEffect(() => {
		if(!prevItemsSource) {
			return;
		}
		if(itemsSource !== prevItemsSource && itemsSource !== 'query') {
			setSearchValue('');
		}
	}, [itemsSource, prevItemsSource]);

	useEffect(() => {
		if(!prevCollection) {
			return;
		}
		if(collection !== prevCollection) {
			setSearchValue('');
		}
	}, [collection, prevCollection]);

	return (
		<div className="search input-group">
			<SearchDropdown
				modes={ modes }
				onKeyDown={ handleKeyDown }
				onSelectMode={ handleSelectMode }
			/>
			<input
				autoFocus={ autoFocus }
				className="form-control search-input with-dropdown"
				onBlur={ handleBlur }
				onChange={ handleSearchChange }
				onKeyDown={ handleKeyDown }
				placeholder={ modes[qmodeValue] }
				ref={ ref => { autoFocus && registerAutoFocus(ref); inputRef.current = ref } }
				tabIndex={ -2 }
				type="search"
				value={ searchValue }
			/>
			{ searchValue.length > 0 && (
				<Button
					icon
					className="clear"
					onClick={ handleSearchClear }
					tabIndex={ -2 }
					onKeyDown={ handleKeyDown }
				>
					<Icon type={ '10/x' } width="10" height="10" />
				</Button>
			)}
		</div>
	);
}

Search.propTypes = {
	autoFocus: PropTypes.bool,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	registerAutoFocus: PropTypes.func,
}

export default memo(Search);
