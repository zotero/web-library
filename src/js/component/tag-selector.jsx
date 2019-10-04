'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Button from './ui/button';
import Icon from './ui/icon';
import Input from './form/input';
import TagList from './tag-selector/tag-list';
import withFocusManager from '../enhancers/with-focus-manager';
import { getTagsData } from '../common/state';
import { navigate, toggleTagSelector } from '../actions';
import { noop } from '../utils';
import { pick } from '../common/immutable';

const TagSelector = props => {
	const { onFocus, onBlur, registerFocusRoot, searchString, onSearch } = props;
	const { isFetching } = useSelector(state => getTagsData(state));
	const { tags: selectedTags, isTagSelectorOpen } = useSelector(state => state.current);
	const dispatch = useDispatch();


	const handleKeyDown = useCallback(ev => {
		const { onFocusNext, onFocusPrev } = props;
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
	})

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
				<TagList
					{ ...pick(props, ['checkColoredTags', 'fetchTags',
						'isFetching', 'onSelect', 'searchString', 'sourceTagsPointer',
						'tags', 'totalTagCount'])
					}
				/>
				<div
					className="tag-selector-filter-container"
					onBlur={ onBlur }
					onFocus={ onFocus }
					ref={ ref => registerFocusRoot(ref) }
					tabIndex={ 0 }
				>
					<Input
						className="tag-selector-filter form-control"
						onChange={ onSearch }
						onKeyDown={ handleKeyDown }
						tabIndex={ -2 }
						type="search"
						value={ searchString }
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
	collectionKey: PropTypes.string,
	fetchTags: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
	isMyPublications: PropTypes.bool,
	isTrash: PropTypes.bool,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onSearch: PropTypes.func,
	onSettings: PropTypes.func,
	qmode: PropTypes.string,
	registerFocusRoot: PropTypes.func,
	search: PropTypes.string,
	searchString: PropTypes.string,
	toggleTagSelector: PropTypes.func,
	view: PropTypes.string,
}

TagSelector.defaultProps = {
	onSearch: noop,
	onSettings: noop,
	searchString: '',
}

export default withFocusManager(TagSelector);
