import cx from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { checkColoredTags, fetchTags, navigate } from '../../actions';
import { isTriggerEvent } from '../../common/event';
import { useFocusManager, useSourceSignature, useTags } from '../../hooks';

const PAGE_SIZE = 100;

const TagList = () => {
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const tagColors = useSelector(state => state.libraries[state.current.libraryKey].tagColors, shallowEqual);
	const dispatch = useDispatch();
	const tagContainerRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev } = useFocusManager(
		tagContainerRef, { isCarousel: false }
	);

	const containerRef = useRef(null);
	const listRef = useRef(null);

	const { isFetching, pointer, tags, totalResults, hasChecked } = useTags();
	const sourceSignature = useSourceSignature();

	const maybeLoadMore = useCallback(() => {
		const containerHeight = containerRef.current.getBoundingClientRect().height;
		const totalHeight = listRef.current.getBoundingClientRect().height;
		const scrollProgress = (containerRef.current.scrollTop + containerHeight) / totalHeight;

		if(pointer && scrollProgress > 0.5 && !isFetching && ((totalResults > pointer) || (totalResults === null))) {
			dispatch(fetchTags(pointer, pointer + PAGE_SIZE - 1));
		}
	});

	const toggleTag = useCallback(tagName => {
		const index = selectedTags.indexOf(tagName);
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		dispatch(navigate({ tags: selectedTags, items: null }));
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
			focusNext(ev);
		} else if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
			focusPrev(ev);
		} else if(isTriggerEvent(ev)) {
			handleClick(ev);
		}
	});

	const handleClick = useCallback(ev => {
		const tag = ev.currentTarget.dataset.tag;
		// @NOTE: the <li> element in this event will be removed while new tags are fetched as a
		// result of toggleTag(). Need to trigger blur() so that container can accept focus again.
		// See #372
		ev.currentTarget.blur();
		toggleTag(tag);
	});

	useEffect(() => {
		if(totalResults === null) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
		}
	}, [totalResults]);

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
			dispatch(checkColoredTags());
		}
	}, [sourceSignature, hasChecked]);

	useEffect(() => {
		dispatch(checkColoredTags());
	}, [tagColors])

	useEffect(() => {
		setTimeout(maybeLoadMore, 0);
	}, [tagsSearchString, pointer]);

	return (
		<div
			className="scroll-container"
			onScroll={ maybeLoadMore }
			ref={ containerRef }
		>
			<div
				className="tag-selector-container"
				onBlur={ receiveBlur }
				onFocus={ receiveFocus }
				ref={ tagContainerRef }
				tabIndex={ 0 }
				aria-label="tag selector"
			>
				<ul
					ref={ listRef }
					className="tag-selector-list"
				>
					{ tags.filter(t => !!t).map(tag => (
						<li
							className={ cx('tag', {
								disabled: tag.disabled,
								selected: tag.selected,
								colored: tag.color,
								placeholder: tag.isPlaceholder
							}) }
							data-tag={ tag.tag }
							key={ tag.tag }
							onClick={ handleClick }
							onKeyDown={ handleKeyDown }
							role="button"
							style={ tag.color && { color: tag.color} }
							tabIndex={ tag.disabled ? null : -2 }
						>
							<span className="tag-label">{ tag.tag }</span>
						</li>
					)) }
				</ul>
			</div>
		</div>
	);
}

export default React.memo(TagList);
