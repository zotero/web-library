import PropTypes from 'prop-types';
import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';

import Button from '../ui/button';
import Editable from '../editable';
import Icon from '../ui/icon';
import { deduplicateByKey, get, getScrollContainerPageCount, noop, sortByKey } from '../../utils';
import { fetchTagSuggestions, updateItem } from '../../actions';
import { pick } from '../../common/immutable';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { pluralize } from '../../common/format';
import { useFocusManager, usePrevious } from '../../hooks';
import { isTriggerEvent } from '../../common/event';

var nextId = 0;

const Tags = props => {
	const { isActive, isReadOnly } = props;
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const initialTags = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey, 'tags'], []));
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const tagColors = useSelector(state => get(state, ['libraries', libraryKey, 'tagColors']));
	const [tags, setTags] = useState(initialTags.map(t => ({ ...t, id: ++nextId })));
	const isPendingTagChanges = useSelector(state =>
		(get(state, ['libraries', state.current.libraryKey, 'updating', 'items', state.current.itemKey]) || [])
		.some(({ patch }) => 'tags' in patch)
	);
	const [tagRedacted, setTagRedacted] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const requestId = useRef(1);
	const addTagRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const { receiveBlur, focusDrillDownPrev, focusDrillDownNext, receiveFocus, focusNext, focusPrev,
		focusBySelector, focusOnLast, resetLastFocused } = useFocusManager(scrollContainerRef, null,
		false);
	const prevInitialTags = usePrevious(initialTags);


	const handleCommit = useCallback(async (newTagValue, hasChanged, ev) => {
		const tag = (ev.currentTarget || ev.target).closest('[data-tag]').dataset.tag;
		setTagRedacted(null);
		setSuggestions([]);
		requestId.current += 1;

		if(!hasChanged) {
			setTags(tags.filter(t => t.tag !== ''));
			return;
		}

		const updatedTags = deduplicateByKey(
			newTagValue === '' ?
				tags.filter(t => t.tag !== tag) :
				tags.map(t => t.tag === tag ? { tag: newTagValue, id: ++nextId } : t),
			'tag'
		);

		sortByKey(updatedTags, 'tag');
		dispatch(updateItem(itemKey, { tags: updatedTags.map(t => pick(t, ['tag'])) }));

		if(tag === '') {
			// if adding a new tag, automatically create input for another one
			updatedTags.push({ tag: '', id: ++nextId });
			setTagRedacted('');
		}

		setTags(updatedTags);
	}, [dispatch, itemKey, tags]);

	const handleCancel = useCallback((_, ev) => {
		setTagRedacted(null);
		setSuggestions([]);
		requestId.current += 1;
		setTags(tags.filter(t => t.tag !== ''));

		ev.stopPropagation();

		if(tagRedacted === '') {
			setTimeout(() => { addTagRef.current.focus(); });
		} else {
			setTimeout(() => { focusOnLast(); });
		}
	}, [focusOnLast, tagRedacted, tags]);

	const handleEdit = useCallback(ev => {
		// if(ev.target !== ev.currentTarget) {
		// 	return;
		// }
		if(isReadOnly) {
			return;
		}
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		setTagRedacted(tag);
	}, [isReadOnly]);

	const handleDelete = useCallback(ev => {
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		const updatedTags = tags.filter(t => t.tag !== tag);
		setTags(updatedTags);
		dispatch(updateItem(itemKey, { tags: updatedTags.map(t => pick(t, ['tag'])) }));
	}, [dispatch, itemKey, tags]);

	const handleAddTag = useCallback(ev => {
		setTags([...tags.filter(t => t.tag !== ''), { tag: '', id: ++nextId }]);
		setTagRedacted('');
	}, [tags]);

	const handleChange = useCallback(async newValue => {
		requestId.current += 1;
		const currentRequest = requestId.current;
		if(newValue.length > 0) {
			const rawSuggestions = await dispatch(fetchTagSuggestions(newValue));
			if(currentRequest !== requestId.current) {
				// These suggestions are now outdated as the input has been changed, commited or cancelled, discard...
				return;
			}
			const processedSuggestions = [...(new Set(rawSuggestions.map(s => s.tag)))];
			const filteredSuggestions = processedSuggestions.filter(s => !tags.some(t => t.tag === s));
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	}, [dispatch, tags]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target.nodeName === 'INPUT') {
			return;
		}
		if(ev.key === "ArrowLeft") {
			focusDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			focusDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && focusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && focusPrev(ev, { targetEnd: addTagRef.current });
		} else if(isTriggerEvent(ev)) {
			const isAddButton = ev.currentTarget === addTagRef.current;
			if(!isAddButton && ev.currentTarget === ev.target && ev.target.dataset.tag) {
				setTagRedacted(ev.target.dataset.tag);
			}
		} else if(ev.key === 'Home') {
			resetLastFocused();
			addTagRef.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			focusBySelector('.tag:last-child');
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.tag');
			focusNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.tag');
			focusPrev(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'Tab') {
			const isAddButton = ev.currentTarget === addTagRef.current;
			const isShift = ev.getModifierState('Shift');
			if(isAddButton && !isShift) {
				ev.target === ev.currentTarget && focusNext(ev);
			}
		}
	}, [focusBySelector, focusDrillDownNext, focusDrillDownPrev, focusNext, focusPrev, resetLastFocused]);

	const handleFocusOnContainer = useCallback(ev => {
		if(ev.target.nodeName === 'INPUT' || isTouchOrSmall) {
			return;
		}
		receiveFocus(ev);
	}, [receiveFocus, isTouchOrSmall]);

	useEffect(() => {
		if(isPendingTagChanges || tagRedacted !== null) {
			// if currently editing or updating tags, discard any remote updates to keep editing smooth
			// otherwise each intermediatry state will flash back when quickly adding or removing tags
			return;
		}
		if(typeof(prevInitialTags) !== 'undefined' && !deepEqual(initialTags, prevInitialTags)) {
			setTags(initialTags.map(t => ({ ...t, id: ++nextId })));
		}
	}, [isPendingTagChanges, tagRedacted, initialTags, prevInitialTags]);

	return (
		<TabPane
			className="tags"
			isActive={ isActive }
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Tags</h5>
			{ !isTouchOrSmall && (
					<Toolbar>
						<div className="toolbar-left">
							<div className="counter">
								{ `${tags.length} ${pluralize('tag', tags.length)}` }
							</div>
							{ !isReadOnly && (
							<ToolGroup>
								<Button
									className="btn-default add-tag"
									disabled={ tagRedacted !== null }
									onClick={ handleAddTag }
									onKeyDown={ handleKeyDown }
									ref={ addTagRef }
									tabIndex={ 0 }
								>
										Add Tag
								</Button>
							</ToolGroup>
							) }
						</div>
					</Toolbar>
				) }
			<div
				className="scroll-container-mouse"
				onBlur={ isTouchOrSmall ? noop : receiveBlur }
				onFocus={ handleFocusOnContainer }
				ref={ scrollContainerRef }
				tabIndex={ 0 }
			>
				{ tags.length > 0 && (
					<nav>
						<ul className="details-list tag-list">
							{
								tags.map(tag => {
									return (
										<li
											className="tag"
											data-key={ tag.id }
											data-tag={ tag.tag }
											key={ tag.id }
											onKeyDown={ handleKeyDown }
											tabIndex={ -2 }
										>
											<Icon
												color={ tag.tag in tagColors ? tagColors[tag.tag] : null }
												height="12"
												symbol={ tag.tag in tagColors ? 'circle' : 'circle-empty' }
												type="12/circle"
												width="12"
											/>
											<Editable
												autoFocus
												isActive={ tag.tag === tagRedacted }
												onCancel={ handleCancel }
												onChange={ handleChange }
												onClick={ handleEdit }
												onCommit={ handleCommit }
												selectOnFocus
												suggestions={ suggestions }
												value={ tag.tag }
												aria-label="tag name"
												tabIndex={ -1 }
											/>
											{ !(tag.tag === tagRedacted && tagRedacted === '') && !isReadOnly && (
												<Button
													aria-label="remove tag"
													icon
													onClick={ handleDelete }
													tabIndex={ -3 }
												>
													<Icon type="16/minus-circle" width="16" height="16" />
												</Button>
											)}
										</li>
									);
								})
							}
						</ul>
					</nav>
				) }
				{ isTouchOrSmall && !isReadOnly && (
					<Button
						onClick={ handleAddTag }
						className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
					>
						<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
						Add Tag
					</Button>
				)}
			</div>
		</TabPane>
	)
}

Tags.propTypes = {
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default memo(Tags);
