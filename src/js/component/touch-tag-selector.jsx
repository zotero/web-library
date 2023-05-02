import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from './ui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from './ui/dropdown';
import FocusTrap from './focus-trap';
import Icon from './ui/icon';
import TagList, { TagListItem } from './tag-selector/tag-list';
import { filterTags, navigate, toggleHideAutomaticTags, toggleModal, toggleTouchTagSelector } from '../actions';
import { MANAGE_TAGS } from '../constants/modals';
import { pluralize } from '../common/format';
import { Toolbar } from './ui/toolbars';
import { useFocusManager, usePrevious, useTags } from '../hooks';
import { isTriggerEvent } from '../common/event';

const TouchTagselectorActions = memo(() => {
	const dispatch = useDispatch();
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isLibraryReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleToggleTagsHideAutomatic = useCallback(() => {
		dispatch(toggleHideAutomaticTags());
	}, [dispatch])

	const handleManageTagsClick = useCallback(() => {
		dispatch(toggleModal(MANAGE_TAGS, true))
	}, [dispatch]);

	return (
		<Dropdown
			isOpen={ isOpen }
			onToggle={ handleToggleDropdown }
			className="new-item-selector"
		>
			<DropdownToggle
				color={ null }
				className="btn-link btn-icon dropdown-toggle"
			>
				<Icon
					type="24/options"
					symbol={ isOpen ? 'options-block' : 'options' }
					width="24"
					height="24"
				/>
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem onClick={ handleToggleTagsHideAutomatic } >
					<span className="tick">{ !tagsHideAutomatic ? "✓" : "" }</span>
					Show Automatic
				</DropdownItem>
				{ !isLibraryReadOnly && (
					<React.Fragment>
						<DropdownItem divider />
						<DropdownItem  onClick={ handleManageTagsClick } >
							Manage Tags
						</DropdownItem>
					</React.Fragment>
				) }
			</DropdownMenu>
		</Dropdown>
	);
});

TouchTagselectorActions.displayName = 'TouchTagselectorActions';

// Despite the name, TouchTagSelector mayb be used on both desktop and touch
const TouchTagSelector = () => {
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const tagsListRef = useRef(null);
	const selectedListRef = useRef();
	const shouldRefocus = useRef(false);
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);
	const isManaging = useSelector(state => state.modal.id === MANAGE_TAGS);
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const { tags, selectedTags } = useTags();
	const wasOpen = usePrevious(isOpen);
	const lastFocus = useRef(null);
	const selectedTagsLength = selectedTags.length;
	const prevSelectedTagsLength = usePrevious(selectedTags.length);
	const prevTagsCount = usePrevious(tags.count);
	const { receiveFocus, receiveBlur, focusBySelector, resetLastFocused, focusNext, focusPrev, focusDrillDownNext,
	focusDrillDownPrev } = useFocusManager(selectedListRef);

	const handleClose = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			dispatch(toggleTouchTagSelector(false));
		}
	}, [dispatch]);

	const handleDeselect = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			dispatch(navigate({ tags: null, items: null }));
		}
	}, [dispatch]);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		dispatch(filterTags(newValue));
	}, [dispatch]);

	const handleSearchClear = useCallback(ev => {
		if(isTriggerEvent(ev)) {
			dispatch(filterTags(''));
			if(inputRef.current) {
				inputRef.current.focus();
			}
		}
	}, [dispatch]);

	const toggleTag = useCallback(tagName => {
		const index = selectedTagNames.indexOf(tagName);
		if(index > -1) {
			if(selectedTagNames.length > 1) {
				const tagIndexToSelect = index + 1 < selectedTagNames.length ? index + 1 : index - 1;
				focusBySelector(`li:nth-child(${tagIndexToSelect + 1})`);
			} else {
				shouldRefocus.current = true;
			}
			selectedTagNames.splice(index, 1);
		} else {
			selectedTagNames.push(tagName);
		}

		dispatch(navigate({ tags: selectedTagNames, items: null, view: 'item-list' }));
	}, [dispatch, focusBySelector, selectedTagNames]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape') {
			dispatch(toggleTouchTagSelector(false));
			ev.preventDefault();
		}
		if(isTriggerEvent(ev)) {
			ev.preventDefault();
		}
	}, [dispatch]);

	useEffect(() => {
		if(isManaging) {
			dispatch(toggleTouchTagSelector(false));
		}
	}, [dispatch, isManaging]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			lastFocus.current = document.activeElement;
			inputRef.current.focus({ preventScroll: true });
		} else if(wasOpen && !isOpen && lastFocus.current && 'focus' in lastFocus.current) {
			lastFocus.current.focus({ preventScroll: true });
			lastFocus.current = null;
		}
	}, [isOpen, wasOpen]);

	useEffect(() => {
		if(prevSelectedTagsLength < selectedTagsLength && selectedListRef.current) {
			focusBySelector('li:last-child');
		}
	}, [focusBySelector, selectedTagsLength, resetLastFocused, prevSelectedTagsLength]);

	useEffect(() => {
		if(shouldRefocus.current && tags.length !== prevTagsCount && tagsListRef.current) {
			shouldRefocus.current = false;
			tagsListRef.current.focus()
		}
	}, [tags.length, prevTagsCount])

	return (
		<FocusTrap disabled={ !isOpen }>
		<CSSTransition
			in={ isOpen }
			timeout={ 600 }
			classNames="slide-up"
			mountOnEnter
			unmountOnExit
			enter={ !isEmbedded }
			exit={ !isEmbedded }
		>
				<div onKeyDown={ handleKeyDown } className="touch-tag-selector">
					{ !isEmbedded && (
						<header className="touch-header">
							<Toolbar>
								<div className="toolbar-left">
									<TouchTagselectorActions />
								</div>
								<div className="toolbar-center">
									{ selectedTagNames.length == 0 ?
										'Tags' :
										`${selectedTagNames.length} ${pluralize('Tag', selectedTagNames.length)} Selected`
									}
								</div>
								<div className="toolbar-right">
									<Button className="btn-link" onClick={ handleClose }>Done</Button>
								</div>
							</Toolbar>
						</header>
					) }
					<div className="filter-container">
						<div className="search input-group">
							<input
								className="form-control tag-selector-filter"
								onChange={ handleSearchChange }
								placeholder="Filter Tags"
								ref={ inputRef }
								type="search"
								value={ tagsSearchString }
							/>
							{ tagsSearchString.length > 0 && (
								<Button
									icon
									className="clear"
									onKeyDown={ handleSearchClear }
									onClick={ handleSearchClear }
								>
									<Icon type={ '10/x' } width="10" height="10" />
								</Button>
							)}
						</div>
						{ isEmbedded && (
							<Button
								icon
								className="embedded-only close"
								onKeyDown={ handleClose }
								onClick={ handleClose }
							>
								<Icon type={ '16/close' } width="16" height="16" />
							</Button>
						) }
					</div>
					{ !isManaging && (
							<React.Fragment>
								{selectedTags.length > 0 && (
									<ul
										ref={ selectedListRef }
										tabIndex={ 0 }
										className="selected-tags tag-selector-list"
										onFocus={ receiveFocus }
										onBlur={ receiveBlur }
										role="list"
										aria-multiselectable="true"
										aria-readonly="true"
										aria-label="selected tags"
										aria-rowcount={ selectedTagsLength }
									>
									{ selectedTags.map(tag => <TagListItem
										key={ tag.tag }
										tag={ tag }
										toggleTag={ toggleTag }
										isSelected={ true }
										focusNext={ focusNext }
										focusPrev={ focusPrev }
										focusDrillDownNext={ focusDrillDownNext }
										focusDrillDownPrev={ focusDrillDownPrev }
									/>) }
									</ul>
								)}
								<TagList ref={ tagsListRef } toggleTag={ toggleTag } />
							</React.Fragment>
					) }
					<footer className="touch-footer">
						<Toolbar>
							<div className="toolbar-center">
								<Button
									onClick={ handleDeselect }
									onKeyDown={ handleDeselect }
									className="btn-link"
									disabled={ selectedTagNames.length === 0 }
								>
									Deselect All
								</Button>
							</div>
						</Toolbar>
					</footer>
				</div>
		</CSSTransition>
		</FocusTrap>
	);
}

export default memo(TouchTagSelector);
