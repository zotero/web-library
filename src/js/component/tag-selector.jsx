'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { useDispatch, useSelector } from 'react-redux';

import Button from './ui/button';
import Icon from './ui/icon';
import Input from './form/input';
import TagList from './tag-selector/tag-list';
import withFocusManager from '../enhancers/with-focus-manager';
import { filterTags, navigate, toggleTagSelector } from '../actions';
import { getTagsData } from '../common/state';

const TagSelector = props => {
	const { onBlur, onFocus, onFocusNext, onFocusPrev, registerFocusRoot } = props; //FocusManager
	const { isFetching } = useSelector(state => getTagsData(state));
	const { tagsSearchString, tags: selectedTags, isTagSelectorOpen } = useSelector(state => state.current);
	const dispatch = useDispatch();

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	});

	const handleDeselectClick = useCallback(() => {
		dispatch(navigate({ tags: [] }));
	});

	const handleCollapseClick = useCallback(() => {
		dispatch(toggleTagSelector(!isTagSelectorOpen));
	});

	const handleSearchChange = useCallback(newValue => {
		dispatch(filterTags(newValue))
	});

	return (
		<div
			className={ cx('tag-selector', { 'collapsed': !isTagSelectorOpen }) }
			>
			<div className="scroll-container">
				<Button
					className="tag-selector-toggle"
					onClick={ handleCollapseClick }
				>
					<Icon type="16/grip" width="16" height="2" />
				</Button>
				<TagList />
				<div
					className="tag-selector-filter-container"
					onBlur={ onBlur }
					onFocus={ onFocus }
					ref={ ref => registerFocusRoot(ref) }
					tabIndex={ 0 }
				>
					<Input
						className="tag-selector-filter form-control"
						onChange={ handleSearchChange }
						onKeyDown={ handleKeyDown }
						tabIndex={ -2 }
						type="search"
						value={ tagsSearchString }
						isBusy={ isFetching }
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
		</div>
	);
}

TagSelector.propTypes = {
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	registerFocusRoot: PropTypes.func,
}

export default withFocusManager(TagSelector);
