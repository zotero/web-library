import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrop } from 'react-dnd';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { isTriggerEvent } from 'web-common/utils';

import { connectionIssues, checkColoredTags, fetchTags, navigate } from '../../actions';
import { containsEmoji, get, makeRequestsUpTo } from '../../utils';
import { ITEM } from '../../constants/dnd';
import { useSourceSignature, useTags } from '../../hooks';

const PAGE_SIZE = 100;

const Tag = memo(props => {
	const { tag, onClick, onKeyDown } = props;
	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [ITEM],
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		// updateItem is dispatched from within TableRow component
		drop: () => ({ targetType: 'tag', tag: tag.tag })
	});

	return drop(
		<li
		className={ cx('tag', {
			disabled: tag.disabled,
			selected: tag.selected,
			colored: tag.color,
			emoji: containsEmoji(tag.tag),
			placeholder: tag.isPlaceholder,
			'dnd-target': isOver && canDrop
		}) }
		data-tag={ tag.tag }
		data-color={ tag.color ? tag.color.toLowerCase() : null }
		key={ tag.tag }
		onClick={ onClick }
		onKeyDown={ onKeyDown }
		role="button"
		style={ tag.color && { color: tag.color} }
		tabIndex={ tag.disabled ? null : -2 }
		aria-pressed={ tag.selected }
		>
			<span className="tag-label">{ tag.tag }</span>
		</li>
	);
});

Tag.displayName = 'Tag';

Tag.propTypes = {
	tag: PropTypes.object,
	onClick: PropTypes.func,
	onKeyDown: PropTypes.func,
};

const TagSelectorItems = () => {
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const tagsHideAutomatic = useSelector(state => state.current.tagsHideAutomatic);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const prevSelectedTagsLength = usePrevious(selectedTags.length);
	const dispatch = useDispatch();
	const tagContainerRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev, focusBySelector } = useFocusManager(tagContainerRef, { isCarousel: false });
	const containerRef = useRef(null);
	const listRef = useRef(null);
	const tagFocusNext = useRef({ tag: null, isQueryChanged: false });
	const { hasMoreItems, isFetching, isFetchingColoredTags, pointer, tags, totalResults, hasChecked,
	hasCheckedColoredTags } = useTags();
	const tagColors = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'tagColors', 'lookup']), shallowEqual);
	const prevTagColors = usePrevious(tagColors);
	const sourceSignature = useSourceSignature();
	const errorCount = useSelector(state => {
		switch(state.current.itemsSource) {
			case 'query': return get(state, ['traffic', 'TAGS_IN_ITEMS_BY_QUERY', 'errorCount'], 0);
			case 'trash': return get(state, ['traffic', 'TAGS_IN_TRASH_ITEMS', 'errorCount'], 0);
			case 'publications': return get(state, ['traffic', 'TAGS_IN_PUBLICATIONS_ITEMS', 'errorCount'], 0);
			case 'collection': return get(state, ['traffic', 'TAGS_IN_COLLECTION', 'errorCount'], 0);
			case 'top': return get(state, ['traffic', 'TAGS_IN_TOP_ITEMS', 'errorCount'], 0);
		}
	});
	const isFiltering = tagsSearchString.length > 0 || tagsHideAutomatic;
	const wasFiltering = usePrevious(isFiltering);
	const prevErrorCount = usePrevious(errorCount);

	const maybeLoadMore = useCallback(() => {
		if(isFiltering) {
			// disable fetch-as-you-scroll mechanism when filtering, we fetch all tags in an effect instead
			return;
		}
		const containerHeight = containerRef.current?.getBoundingClientRect?.().height ?? 0;
		const totalHeight = listRef.current?.getBoundingClientRect?.().height ?? 0;
		const scrollProgress = (containerRef.current?.scrollTop + containerHeight) / totalHeight;

		if(pointer && scrollProgress > 0.5 && !isFetching && ((totalResults > pointer) || (totalResults === null))) {
			dispatch(fetchTags(pointer, pointer + PAGE_SIZE - 1));
		}
	}, [dispatch, isFetching, isFiltering, pointer, totalResults]);

	const toggleTag = useCallback(tagName => {
		const index = selectedTags.indexOf(tagName);
		if(index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagName);
		}

		dispatch(navigate({ tags: selectedTags, items: null }));
	}, [dispatch, selectedTags]);

	const handleClick = useCallback(ev => {
		const tag = ev.currentTarget.dataset.tag;
		// @NOTE: the <li> element in this event will be removed while new tags are fetched as a
		// result of toggleTag(). Need to trigger blur() so that container can accept focus again.
		// See #372
		ev.currentTarget.blur();
		tagFocusNext.current = { tag: ev.currentTarget.dataset.tag, isQueryChanged: false };
		toggleTag(tag);
	}, [toggleTag]);

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
	}, [focusNext, focusPrev, handleClick]);

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
		}
	}, [dispatch, sourceSignature, hasChecked, isFetching]);

	useEffect(() => {
		if(!isFetchingColoredTags && typeof(prevTagColors) !== 'undefined' && !shallowEqual(tagColors, prevTagColors)) {
			dispatch(checkColoredTags());
		} else if(!hasCheckedColoredTags && !isFetchingColoredTags) {
			dispatch(checkColoredTags());
		}
	}, [dispatch, sourceSignature, prevTagColors, tagColors, hasCheckedColoredTags, isFetchingColoredTags]);

	useEffect(() => {
		// if we're filtering, we need to prefetch all matching tags under spinner
		// this is because filtering happens locally and we don't know the number of total results
		if (hasMoreItems && (isFiltering && !wasFiltering)) {
			Promise.all(makeRequestsUpTo(pointer, totalResults, PAGE_SIZE).map(r => dispatch(fetchTags(r.start, r.stop))));
		}
	}, [dispatch, hasMoreItems, isFiltering, pointer, totalResults, wasFiltering]);

	useEffect(() => {
		if(errorCount > 3 && prevErrorCount === 3) {
			dispatch(connectionIssues());
		} else if(errorCount === 0 && prevErrorCount > 0) {
			dispatch(connectionIssues(true));
		}
	}, [dispatch, errorCount, prevErrorCount]);

	useEffect(() => {
		if (selectedTags.length !== prevSelectedTagsLength && tagFocusNext.current) {
			tagFocusNext.current.isQueryChanged = true;
		}
	}, [selectedTags.length, prevSelectedTagsLength]);

	// on every render try to re-focus the tag that was focused before tag query changed
	// See #372 and #507
	useEffect(() => {
		if (tagFocusNext.current.tag !== null && tagFocusNext.current.isQueryChanged) {
			const selector = `[data-tag="${tagFocusNext.current.tag}"]`;
			if (tagContainerRef.current?.querySelector(selector)) {
				focusBySelector(selector);
				tagFocusNext.current = { tag: null, isQueryChanged: false };
			}
		}
	});

	return (
		<div
			tabIndex="-1"
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
					{ tags.filter(t => t && t.tag).map(tag => (
						<Tag key={ tag.tag } tag={ tag } onClick={ handleClick } onKeyDown={ handleKeyDown } />
					)) }
				</ul>
			</div>
		</div>
	);
}

export default memo(TagSelectorItems);
