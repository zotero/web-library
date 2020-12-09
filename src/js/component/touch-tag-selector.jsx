import PropTypes from 'prop-types';
import React, { memo, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Button from './ui/button';
import { Toolbar } from './ui/toolbars';
import Icon from './ui/icon';
import TouchTagList from './tag-selector/touch-tag-list';
import { filterTags, navigate, toggleTouchTagSelector } from '../actions';
import { useTags } from '../hooks';
import { pluralize } from '../common/format';

const SelectedTagRow = ({ tag, toggleTag }) => {
	const handleClick = useCallback(() => toggleTag(tag.tag), [tag, toggleTag]);

	return (
		<li className="tag">
			<div className="tag-color" style={ tag.color && { color: tag.color } } />
			<div className="truncate">{ tag.tag }</div>
			<Button
				className="btn-circle btn-secondary"
				onClick={ handleClick }
			>
				<Icon type="16/minus-strong" width="16" height="16" />
			</Button>
		</li>
	);
}

SelectedTagRow.propTypes = {
	tag: PropTypes.object,
	toggleTag: PropTypes.func,
}

const TouchTagSelector = () => {
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);
	const { selectedTags } = useTags();

	const handleClick = useCallback(() => {
		dispatch(toggleTouchTagSelector(false));
	}, [dispatch]);

	const handleDeselectClick = useCallback(() => {
		dispatch(navigate({ tags: null, items: null }));
	}, [dispatch]);

	const handleSearchChange = useCallback(ev => {
		const newValue = ev.currentTarget.value;
		dispatch(filterTags(newValue));
	}, [dispatch]);

	const handleSearchClear = useCallback(() => {
		dispatch(filterTags(''));
		if(inputRef.current) {
			inputRef.current.focus();
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

	return (
		<CSSTransition
			in={ isOpen }
			timeout={ 600 }
			classNames="slide-up"
			mountOnEnter
			unmountOnExit
		>
			<div className="touch-tag-selector">
				<header className="touch-header">
					<Toolbar>
						<div className="toolbar-left" />
						<div className="toolbar-center">
							{ selectedTagNames.length == 0 ?
								'Tags' :
								`${selectedTagNames.length} ${pluralize('Tag', selectedTagNames.length)} Selected`
							}
						</div>
						<div className="toolbar-right">
							<Button className="btn-link" onClick={ handleClick }>Done</Button>
						</div>
					</Toolbar>
				</header>
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
								onClick={ handleSearchClear }
							>
								<Icon type={ '10/x' } width="10" height="10" />
							</Button>
						)}
					</div>
				</div>
				<ul className="selected-tags">
					{ selectedTags.map(tag => <SelectedTagRow
						key={ tag.tag }
						tag={ tag }
						toggleTag={ toggleTag }
					/>) }
				</ul>
				<TouchTagList toggleTag={ toggleTag } />
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
		</CSSTransition>
	);
}

export default memo(TouchTagSelector);
