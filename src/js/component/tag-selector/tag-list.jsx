import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import withFocusManager from '../../enhancers/with-focus-manager';
import { checkColoredTags, fetchTags, navigate } from '../../actions';
import { isTriggerEvent } from '../../common/event';
import { useSourceSignature, useTags } from '../../hooks';

const PAGE_SIZE = 100;

const TagList = props => {
	const { onBlur, onFocus, onFocusNext, onFocusPrev, registerFocusRoot } = props; // FocusManager
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const selectedTags = useSelector(state => state.current.tags, shallowEqual);
	const dispatch = useDispatch();

	const containerRef = useRef(null);
	const listRef = useRef(null);

	const tagContainerRefCb = useCallback(node => {
		registerFocusRoot(node);
	});

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
		if(totalResults === null) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
		}
	}, [totalResults]);

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, PAGE_SIZE - 1));
			dispatch(checkColoredTags());
		}
	}, [sourceSignature]);

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
					{ tags.filter(t => !!t).map(tag => (
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
