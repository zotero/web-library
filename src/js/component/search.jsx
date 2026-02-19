import PropTypes from 'prop-types';
import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSelector } from 'react-redux';
import { Button, DropdownToggle, DropdownMenu, DropdownItem, Icon, UncontrolledDropdown } from 'web-common/components';
import { noop } from 'web-common/utils';

const modes = {
	titleCreatorYear: "Title, Creator, Year",
	everything: "Title, Creator, Year + Full-Text Content"
};

const SearchDropdown = memo(({ currentMode, modes, onKeyDown, onSelectMode }) => (
	<UncontrolledDropdown placement="bottom-start" strategy="fixed">
		<DropdownToggle
			color={ null }
			className="btn-icon dropdown-toggle"
			tabIndex={ -2 }
			onKeyDown={ onKeyDown }
			title="Search Mode"
		>
			<Icon type={ '24/search-options' } width="24" height="24" />
		</DropdownToggle>
		<DropdownMenu>
			<DropdownItem
				data-qmode="titleCreatorYear"
				onClick={ onSelectMode }
			>
				<span aria-hidden="true" role="presentation" className="tick">{currentMode === 'titleCreatorYear' ? "✓" : ""}</span>
				{ modes['titleCreatorYear'] }
			</DropdownItem>
			<DropdownItem
				data-qmode="everything"
				onClick={ onSelectMode }
			>
				<span aria-hidden="true" role="presentation" className="tick">{currentMode === 'everything' ? "✓" : ""}</span>
				{ modes['everything'] }
			</DropdownItem>
		</DropdownMenu>
	</UncontrolledDropdown>
));

SearchDropdown.displayName = 'SearchDropdown';

SearchDropdown.propTypes = {
	currentMode: PropTypes.string.isRequired,
	modes: PropTypes.object,
	onSelectMode: PropTypes.func,
	onKeyDown: PropTypes.func,
};

const Search = memo(forwardRef((props, ref) => {
	const { debounce = 300, onFocusNext = noop, onFocusPrev = noop, autoFocus, registerAutoFocus = noop,
		search = '', searchState = {}, qmode, isAdvancedSearch, onSearch = noop,
		onToggleAdvancedSearch = noop, onResetQuery = noop
	} = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const inputRef = useRef(null);
	// on single-column devices allow re-querying after initial mount because search input is being
	// unmounted when navigating into an item and remounted back when on the list
	const hasBlurredSinceLastSearch = useRef(isSingleColumn);

	const [searchValue, setSearchValue] = useState(search);
	const [qmodeValue, setQmodeValue] = useState(qmode || 'titleCreatorYear');

	useImperativeHandle(ref, () => ({
		focus: () => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		},
		reset: () => {
			setSearchValue('');
			performSearchDebounce.cancel();
		}
	}));

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
		onSearch(({ attachmentKey, view, noteKey, items, search: newSearchValue, qmode: newQmodeValue }));
	}, [isSingleColumn, onSearch, searchState]);

	const performSearchDebounce =
		useDebouncedCallback(performSearch, debounce);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		setSearchValue(newValue);
		hasBlurredSinceLastSearch.current = false;

		if(newValue.includes('"') && !isAdvancedSearch && !isTouchOrSmall) {
			onToggleAdvancedSearch(true);
		} else if(isAdvancedSearch && newValue.length === 0) {
			onToggleAdvancedSearch(false);
		}

		if(isTouchOrSmall || (!isAdvancedSearch && !newValue.includes('"'))) {
			performSearchDebounce(newValue, qmodeValue);
		}
	}, [isAdvancedSearch, isTouchOrSmall, onToggleAdvancedSearch, performSearchDebounce, qmodeValue]);

	const handleSearchClear = useCallback(() => {
		performSearchDebounce.cancel();
		setSearchValue('');
		onToggleAdvancedSearch(false);
		performSearchDebounce('', qmodeValue);
		inputRef.current.focus();
	}, [onToggleAdvancedSearch, performSearchDebounce, qmodeValue]);

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
				onResetQuery();
				onToggleAdvancedSearch(false);
				performSearch(searchValue, qmodeValue);
				hasBlurredSinceLastSearch.current = false;
			}
		}
	}, [onFocusNext, onFocusPrev, isAdvancedSearch, performSearchDebounce, onResetQuery, onToggleAdvancedSearch, performSearch, searchValue, qmodeValue]);

	const handleBlur = useCallback(() => {
		hasBlurredSinceLastSearch.current = true;
	}, []);

	return (
		<div className="search input-group">
			<SearchDropdown
				currentMode={ qmodeValue }
				modes={ modes }
				onKeyDown={ handleKeyDown }
				onSelectMode={ handleSelectMode }
			/>
			<input
				aria-label={ modes[qmodeValue] }
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
					aria-label="Clear Search"
				>
					<Icon type={ '10/x' } width="10" height="10" />
				</Button>
			)}
		</div>
	);
}));

Search.displayName = 'Search';

Search.propTypes = {
	debounce: PropTypes.number,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	autoFocus: PropTypes.bool,
	registerAutoFocus: PropTypes.func,
	search: PropTypes.string,
	searchState: PropTypes.object,
	qmode: PropTypes.string,
	isAdvancedSearch: PropTypes.bool,
	onSearch: PropTypes.func,
	onToggleAdvancedSearch: PropTypes.func,
	onResetQuery: PropTypes.func,
}

export default Search;
