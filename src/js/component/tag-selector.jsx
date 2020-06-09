import cx from 'classnames';
import React, { useCallback, useRef, memo } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDebounce } from "use-debounce";

import Button from './ui/button';
import Icon from './ui/icon';
import Input from './form/input';
import TagList from './tag-selector/tag-list';
import { filterTags, navigate, toggleTagSelector } from '../actions';
import { useTags, useFocusManager } from '../hooks';
import { getUniqueId } from '../utils';

const TagSelector = () => {
	const { isFetching } = useTags();
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const isTagSelectorOpen = useSelector(state => state.current.isTagSelectorOpen);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const dispatch = useDispatch();
	const [isBusy] = useDebounce(isFetching, 100);
	const id = useRef(getUniqueId('tag-selector-'));
	const filterToolbarRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev } = useFocusManager(filterToolbarRef);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			focusPrev(ev);
		}
	}, [focusNext, focusPrev]);

	const handleDeselectClick = useCallback(() => {
		dispatch(navigate({ tags: [] }));
	}, [dispatch]);

	const handleCollapseClick = useCallback(() => {
		dispatch(toggleTagSelector(!isTagSelectorOpen));
	}, [dispatch, isTagSelectorOpen]);

	const handleSearchChange = useCallback(newValue => {
		dispatch(filterTags(newValue))
	}, [dispatch]);

	return (
		<div
			id={ id.current }
			className={ cx('tag-selector', { 'collapsed': !isTagSelectorOpen }) }
		>
			<Button
				aria-controls={ id.current }
				aria-expanded={ isTagSelectorOpen }
				aria-label={ `${isTagSelectorOpen ? 'collapse' : 'show'} tag selector` }
				className="tag-selector-toggle"
				onClick={ handleCollapseClick }
			>
				<Icon type="16/grip" width="16" height="2" />
			</Button>
			<TagList />
			<div
				className="tag-selector-filter-container"
				onBlur={ receiveBlur }
				onFocus={ receiveFocus }
				ref={ filterToolbarRef }
				tabIndex={ 0 }
			>
				<Input
					className="tag-selector-filter form-control"
					onChange={ handleSearchChange }
					onKeyDown={ handleKeyDown }
					tabIndex={ -2 }
					type="search"
					value={ tagsSearchString }
					isBusy={ isBusy }
					placeholder="Filter Tags"
				/>
				<UncontrolledDropdown className="dropdown">
						<DropdownToggle
							className="btn-icon dropdown-toggle tag-selector-actions"
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							color={ null }
						>
							<Icon type="16/options" width="16" height="16" />
						</DropdownToggle>
						<DropdownMenu right>
							<DropdownItem disabled>
								{ selectedTags.length } tag selected
							</DropdownItem>
							<DropdownItem onClick={ handleDeselectClick } >
								Deselect All
							</DropdownItem>
						</DropdownMenu>
				</UncontrolledDropdown>
			</div>
		</div>
	);
};

export default memo(TagSelector);
