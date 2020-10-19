import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';

import Button from './ui/button';
import Icon from './ui/icon';
import { navigate, resetQuery } from '../actions';
import { noop } from '../utils';
import { usePrevious } from '../hooks';

const SEARCH_INPUT_DEBOUNCE_DELAY = 300; //ms
const modes = {
	titleCreatorYear: "Title, Creator, Year",
	everything: "Title, Creator, Year + Full-Text Content"
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
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);

	const inputRef = useRef(null);

	// on single-column devices allow re-querying after initial mount because search input is being
	// unmounted when navigating into an item and remounted back when on the list
	const hasBlurredSinceLastSearch = useRef(isSingleColumn);

	const [searchValue, setSearchValue] = useState(search);
	const [qmodeValue, setQmodeValue] = useState(qmode || 'titleCreatorYear');

	const performSearch = useCallback((newSearchValue, newQmodeValue) => {
		var view, items;

		if(!newSearchValue) {
			// if search is not empty, go back to the view that triggered the search
			view = searchState.triggerView ?
				searchState.triggerView === 'item-details' ?
					searchState.triggerItem ? 'item-details' : 'item-list'
					: searchState.triggerView
				: view
			items = searchState.triggerView === 'item-details' && searchState.triggerItem ?
				searchState.triggerItem : null;
		}
		dispatch(navigate(({ view, items, search: newSearchValue, qmode: newQmodeValue })));
	}, [dispatch, searchState]);

	const performSearchDebounce =
		useDebouncedCallback(performSearch, SEARCH_INPUT_DEBOUNCE_DELAY);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		setSearchValue(newValue);
		performSearchDebounce.callback(newValue, qmodeValue);
		hasBlurredSinceLastSearch.current = false;
	}, [performSearchDebounce, qmodeValue]);

	const handleSearchClear = useCallback(() => {
		performSearchDebounce.cancel();
		setSearchValue('');
		performSearchDebounce.callback('', qmodeValue);
		inputRef.current.focus();
	}, [performSearchDebounce, qmodeValue]);

	const handleSelectMode = useCallback(ev => {
		setQmodeValue(ev.currentTarget.dataset.qmode);
		if(searchValue.length > 0) {
			performSearchDebounce.callback(searchValue, ev.currentTarget.dataset.qmode);
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
			if(ev.target === inputRef.current && hasBlurredSinceLastSearch.current) {
				if(performSearchDebounce.pending()) {
					performSearchDebounce.flush();
				}
				dispatch(resetQuery());
				performSearch(searchValue, qmodeValue);
				hasBlurredSinceLastSearch.current = false;
			}
		}
	}, [dispatch, onFocusNext, onFocusPrev, performSearch, performSearchDebounce, searchValue, qmodeValue]);

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
			<UncontrolledDropdown
				className="dropdown"
			>
				<DropdownToggle
					color={ null }
					className="btn-icon dropdown-toggle"
					tabIndex={ -2 }
					onKeyDown={ handleKeyDown }
				>
					<Icon type={ '24/search-options' } width="24" height="24" />
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem
						data-qmode="titleCreatorYear"
						onClick={ handleSelectMode }
					>
						{ modes['titleCreatorYear'] }
					</DropdownItem>
					<DropdownItem
						data-qmode="everything"
						onClick={ handleSelectMode }
					>
						{ modes['everything'] }
					</DropdownItem>
				</DropdownMenu>
			</UncontrolledDropdown>
			<input
				autoFocus={ autoFocus }
				className="form-control search-input"
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

export default memo(Search);
