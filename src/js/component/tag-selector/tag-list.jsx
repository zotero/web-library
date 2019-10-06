import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import withFocusManager from '../../enhancers/with-focus-manager';
import { checkColoredTags, fetchTags, navigate } from '../../actions';
import { deduplicateByKey, get } from '../../utils';
import { getTagsData } from '../../common/state';
import { isTriggerEvent } from '../../common/event';

const PAGE_SIZE = 100;

const TagList = props => {
	const { onBlur, onFocus, onFocusNext, onFocusPrev, registerFocusRoot } = props; // FocusManager
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const { isFetching, pointer: sourceTagsPointer = 0, tags: sourceTags = [], totalResults: totalTagCount = null } =
		useSelector(state => getTagsData(state), shallowEqual);
	const tagColors = useSelector(state =>  get(state, ['libraries', state.current.libraryKey, 'tagColors'], {}), shallowEqual);
	const dispatch = useDispatch();

	const containerRef = useRef(null);
	const listRef = useRef(null);

	const tagContainerRefCb = useCallback(node => {
		registerFocusRoot(node);
	});

	const tags = useMemo(() => {
		const tagsSearchStringLC = tagsSearchString.toLowerCase();
		const newTags = deduplicateByKey([
			...Object.keys(tagColors),
			...(tagsSearchString === '' ? sourceTags : sourceTags.filter(
				tag => tag.toLowerCase().includes(tagsSearchStringLC)
			))
		].map(tag => ({
			tag,
			color: tag in tagColors ? tagColors[tag] : null,
			disabled: tag in tagColors && !sourceTags.includes(tag),
			selected: selectedTags.includes(tag)
		})), 'tag');

		return newTags;
	}, [sourceTags, tagColors, tagsSearchString]);

	const maybeLoadMore = useCallback(() => {
		const containerHeight = containerRef.current.getBoundingClientRect().height;
		const totalHeight = listRef.current.getBoundingClientRect().height;
		const scrollProgress = (containerRef.current.scrollTop + containerHeight) / totalHeight;

		if(scrollProgress > 0.5 && !isFetching && (totalTagCount > sourceTagsPointer) || (totalTagCount === null)) {
			dispatch(fetchTags({ start: sourceTagsPointer, limit: PAGE_SIZE, sort: 'title' }));
		}
	});

	const toggleTag = useCallback(tagName => {
		const index = selectedTags.indexOf(tagName);
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		dispatch(navigate({ tags: selectedTags }));
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
			onFocusPrev(ev);
		} else if(isTriggerEvent(ev)) {
			const tag = ev.currentTarget.dataset.tag;
			toggleTag(tag);
		}
	});

	const handleClick = useCallback(ev => {
		const tag = ev.currentTarget.dataset.tag;
		toggleTag(tag);
	});

	useEffect(() => {
		if(totalTagCount === null) {
			dispatch(fetchTags({ start: 0, limit: PAGE_SIZE, sort: 'title' }));
		}
	}, [totalTagCount]);


	useEffect(() => {
		if(sourceTagsPointer < totalTagCount) {
			dispatch(checkColoredTags());
		}
	}, []);

	useEffect(() => {
		if(totalTagCount > PAGE_SIZE) {
			dispatch(checkColoredTags());
		}
	}, [totalTagCount]);

	useEffect(() => {
		setTimeout(maybeLoadMore, 0);
	}, [tagsSearchString, sourceTagsPointer]);

	return (
		<div
			className="scroll-container"
			onScroll={ maybeLoadMore }
			ref={ containerRef }
		>
			<div
				className="tag-selector-container"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ tagContainerRefCb }
				tabIndex={ 0 }
			>
				<ul
					ref={ listRef }
					className="tag-selector-list"
				>
					{ tags.map(tag => (
						<li
							className={ cx('tag', {
								disabled: tag.disabled,
								selected: tag.selected,
								colored: tag.color,
								placeholder: tag.isPlaceholder
							}) }
							key={ tag.tag }
							data-tag={ tag.tag }
							onClick={ handleClick }
							onKeyDown={ handleKeyDown }
							tabIndex={ tag.disabled ? null : -2 }
							style={ tag.color && { color: tag.color} }
						>
							<span className="tag-label">{ tag.tag }</span>
						</li>
					)) }
				</ul>
			</div>
		</div>
	);
}

TagList.propTypes = {
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	registerFocusRoot: PropTypes.func,
	tagsSearchString: PropTypes.string,
};

export default React.memo(withFocusManager(TagList));
