import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from './ui/button';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import FocusTrap from './focus-trap';
import Icon from './ui/icon';
import TagList from './tag-selector/tag-list';
import { filterTags, navigate, toggleHideAutomaticTags, toggleModal, toggleTouchTagSelector } from '../actions';
import { MANAGE_TAGS } from '../constants/modals';
import { pluralize } from '../common/format';
import { Toolbar } from './ui/toolbars';
import { usePrevious, useTags } from '../hooks';
import { isTriggerEvent } from '../common/event';

const SelectedTagRow = ({ tag, toggleTag }) => {
	const handleClick = useCallback(() => toggleTag(tag.tag), [tag, toggleTag]);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	return (
		<li className="tag">
			<div className="tag-color" style={ tag.color && { color: tag.color } } />
			<div className="truncate">{ tag.tag }</div>
			{ isTouchOrSmall ? (
				<Button
					className="btn-circle btn-secondary"
					onClick={ handleClick }
				>
					<Icon type="16/minus-strong" width="16" height="16" />
				</Button>
			) : (
				<Button
					aria-label="delete attachment"
					icon
					onClick={ handleClick }
					tabIndex={ -3 }
				>
					<Icon type={ '16/minus-circle' } width="16" height="16" />
				</Button>
			) }
		</li>
	);
}

SelectedTagRow.propTypes = {
	tag: PropTypes.object,
	toggleTag: PropTypes.func,
}

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
			toggle={ handleToggleDropdown }
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
			<DropdownMenu right>
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


const TouchTagSelector = () => {
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);
	const isManaging = useSelector(state => state.modal.id === MANAGE_TAGS);
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const { selectedTags } = useTags();
	const wasOpen = usePrevious(isOpen);
	const lastFocus = useRef(null);

	const handleClose = useCallback(() => {
		if(isTriggerEvent) {
			dispatch(toggleTouchTagSelector(false));
		}
	}, [dispatch]);

	const handleDeselectClick = useCallback(() => {
		dispatch(navigate({ tags: null, items: null }));
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
			selectedTagNames.splice(index, 1);
		} else {
			selectedTagNames.push(tagName);
		}

		dispatch(navigate({ tags: selectedTagNames, items: null, view: 'item-list' }));
	}, [dispatch, selectedTagNames]);

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

	return (
		<CSSTransition
			in={ isOpen }
			timeout={ 600 }
			classNames="slide-up"
			mountOnEnter
			unmountOnExit
			enter={ !isEmbedded }
			exit={ !isEmbedded }
		>
			<FocusTrap>
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
								<ul className="selected-tags">
								{ selectedTags.map(tag => <SelectedTagRow
									key={ tag.tag }
									tag={ tag }
									toggleTag={ toggleTag }
								/>) }
								</ul>
								<TagList toggleTag={ toggleTag } />
							</React.Fragment>
					) }
					<footer className="touch-footer">
						<Toolbar>
							<div className="toolbar-center">
								<Button
									onClick={ handleDeselectClick }
									className="btn-link"
									disabled={ selectedTagNames.length === 0 }
								>
									Deselect All
								</Button>
							</div>
						</Toolbar>
					</footer>
				</div>
			</FocusTrap>
		</CSSTransition>
	);
}

export default memo(TouchTagSelector);
