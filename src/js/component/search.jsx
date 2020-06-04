import React, { memo, useCallback, useRef, useState } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';

import Button from './ui/button';
import Icon from './ui/icon';
import { navigate, triggerSearchMode } from '../actions';
import { noop } from '../utils';

const SEARCH_INPUT_DEBOUNCE_DELAY = 300; //ms
const modes = {
	titleCreatorYear: "Title, Creator, Year",
	everything: "Everything"
};

const Search = props => {
	const { onFocusNext = noop, onFocusPrev = noop, autoFocus, registerAutoFocus = noop } = props;
	const dispatch = useDispatch();
	const search = useSelector(state => state.current.search);
	const searchState = useSelector(state => state.current.searchState);
	const qmode = useSelector(state => state.current.qmode);

	const inputRef = useRef(null);

	const [searchValue, setSearchValue] = useState(search);
	const [qmodeValue, setQmodeValue] = useState(qmode || 'titleCreatorYear');

	const [performSearch, cancelPerformSearch] = useDebouncedCallback((newSearchValue, newQmodeValue) => {
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

			dispatch(triggerSearchMode(false));
		}
		dispatch(navigate(({ view, items, search: newSearchValue, qmode: newQmodeValue })));
	}, SEARCH_INPUT_DEBOUNCE_DELAY);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		setSearchValue(newValue);
		performSearch(newValue, qmodeValue);
	}, [performSearch, qmodeValue]);

	const handleSearchClear = useCallback(() => {
		cancelPerformSearch();
		setSearchValue('');
		performSearch('', qmodeValue);
		inputRef.current.focus();
	}, [cancelPerformSearch, performSearch, qmodeValue]);

	const handleSelectMode = useCallback(ev => {
		setQmodeValue(ev.currentTarget.dataset.qmode);
		if(searchValue.length > 0) {
			performSearch(searchValue, ev.currentTarget.dataset.qmode);
		}
	}, [performSearch, searchValue]);

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
		}
	}, [onFocusNext, onFocusPrev]);

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
				onChange={ handleSearchChange }
				onKeyDown={ handleKeyDown }
				placeholder={ modes[qmodeValue] }
				ref={ ref => { autoFocus && registerAutoFocus(ref); inputRef.current = ref } }
				type="search"
				value={ searchValue }
				tabIndex={ -2 }
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
