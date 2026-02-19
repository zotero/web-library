import { useDebounce } from "use-debounce";
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import cx from 'classnames';
import { Fragment, useCallback, useRef, useState, memo } from 'react';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useFocusManager  } from 'web-common/hooks';

import Input from './form/input';
import TagSelectorItems from './tag-selector/tag-selector-items';
import { filterTags, navigate, toggleModal, toggleHideAutomaticTags, toggleTagSelector } from '../actions';
import { useTags } from '../hooks';
import { getUniqueId } from '../utils';
import { MANAGE_TAGS } from '../constants/modals';


const TagSelector = () => {
	const { isFetching } = useTags();
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const isTagSelectorOpen = useSelector(state => state.current.isTagSelectorOpen);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const isManaging = useSelector(state => state.modal.id === MANAGE_TAGS);
	const isLibraryReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
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

	const handleToggleTagsHideAutomatic = useCallback(() => {
		dispatch(toggleHideAutomaticTags());
	}, [dispatch])

	const [isOptionsOpen, setIsOptionsOpen] = useState(false);

	const handleOptionsToggle = useCallback(() => {
		setIsOptionsOpen(isOpen => !isOpen);
	}, []);

	const handleManageTagsClick = useCallback(ev => {
		// Hide dropdown immediately to prevent focus theft from modal input
		// (instead of relying on DropdownItem's default handler)
		ev.preventDefault();
		setIsOptionsOpen(false);
		dispatch(toggleModal(MANAGE_TAGS, true));
	}, [dispatch]);

	return (
		<nav
			aria-label="tag selector"
			id={ id.current }
			className={ cx('tag-selector', { 'collapsed': !isTagSelectorOpen }) }
		>
			<Button
				aria-controls={ id.current }
				aria-expanded={ isTagSelectorOpen }
				className="tag-selector-toggle"
				onClick={ handleCollapseClick }
				title={`${isTagSelectorOpen ? 'Collapse' : 'Show'} Tag Selector`}
			>
				<Icon type="16/grip" width="16" height="2" />
			</Button>
			{ isManaging ? <div className="tag-manager-open-info"><span>Tag Manager is Open</span></div> : <TagSelectorItems /> }
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
					value={ isManaging ? "" : tagsSearchString }
					isBusy={ isBusy && !isManaging }
					placeholder="Filter Tags"
					aria-label="Filter Tags"
				/>
				<Dropdown
					isOpen={ isOptionsOpen }
					onToggle={ handleOptionsToggle }
					placement="top-end"
					strategy="fixed"
				>
						<DropdownToggle
							className="btn-icon dropdown-toggle tag-selector-actions"
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Tag Selector Options"
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
							<DropdownItem divider />
							<DropdownItem onClick={ handleToggleTagsHideAutomatic } >
								<span className="tick">{ !tagsHideAutomatic ? "✓" : "" }</span>
								Show Automatic
							</DropdownItem>
							{ !isLibraryReadOnly && (
								<Fragment>
									<DropdownItem divider />
									<DropdownItem onClick={ handleManageTagsClick } >
										Manage Tags
									</DropdownItem>
								</Fragment>
							) }
						</DropdownMenu>
				</Dropdown>
			</div>
		</nav>
	);
};

export default memo(TagSelector);
