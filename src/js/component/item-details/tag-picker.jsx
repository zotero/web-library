import PropTypes from 'prop-types';
import { memo, useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import { Button, Icon } from 'web-common/components';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import { isTriggerEvent, noop, pick } from 'web-common/utils';

import Editable from '../editable';
import { deduplicateByKey, get, getScrollContainerPageCount, sortByKey, stopPropagation } from '../../utils';
import { fetchTagSuggestions, updateItem } from '../../actions';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { pluralize } from '../../common/format';

var nextId = 0;

const TagPickerItem = memo(({ isReadOnly, onCancel, onChange, onCommit, onDelete,
	onEdit, onEditableBlur, onKeyDown, suggestions, tag, tagColors, tagRedacted
 }) => {
	const ref = useRef(null);
	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(
		ref, { targetTabIndex: -3, isFocusable: true, isCarousel: false }
	);

	const handleKeyDown = useCallback(ev => {
		if (ev.key === "ArrowLeft") {
			focusPrev(ev, { useCurrentTarget: false });
		} else if (ev.key === "ArrowRight") {
			focusNext(ev, { useCurrentTarget: false });
		} else {
			onKeyDown(ev);
		}
	}, [focusNext, focusPrev, onKeyDown]);

	return (
		<li
			aria-label={tag.tag === tagRedacted ? null : tag.tag}
			className="tag"
			data-tag={tag.tag}
			key={tag.id}
			onKeyDown={handleKeyDown}
			tabIndex={-2}
			ref={ref}
			onFocus={receiveFocus}
			onBlur={receiveBlur}
		>

			<Icon
				color={tag.tag in tagColors ? tagColors[tag.tag] : null}
				height="12"
				symbol={tag.tag in tagColors ? 'circle' : 'circle-empty'}
				type="12/circle"
				width="12"
			/>
			<Editable
				autoFocus
				isActive={tag.tag === tagRedacted}
				onCancel={onCancel}
				onChange={onChange}
				onClick={onEdit}
				onCommit={onCommit}
				onKeyDown={stopPropagation}
				onBlur={onEditableBlur}
				selectOnFocus
				suggestions={suggestions}
				value={tag.tag}
				aria-label="Tag Name"
				tabIndex={-1}
			/>
			{!(tag.tag === tagRedacted && tagRedacted === '') && !isReadOnly && (
				<Button
					aria-label="remove tag"
					icon
					onClick={onDelete}
					tabIndex={-3}
				>
					<Icon type="16/minus-circle" width="16" height="16" />
				</Button>
			)}
		</li>
	);
});

TagPickerItem.displayName = 'TagPickerItem';

TagPickerItem.propTypes = {
	isReadOnly: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
	onChange: PropTypes.func.isRequired,
	onCommit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onEdit: PropTypes.func.isRequired,
	onEditableBlur: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func.isRequired,
	suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
	tag: PropTypes.shape({
		id: PropTypes.number.isRequired,
		tag: PropTypes.string.isRequired,
	}).isRequired,
	tagColors: PropTypes.object,
	tagRedacted: PropTypes.string,
}

const TagPicker = ({ itemKey, libraryKey, isReadOnly }) => {
	const dispatch = useDispatch();
	const initialTags = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey, 'tags'], []));
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const tagColors = useSelector(state => get(state, ['libraries', libraryKey, 'tagColors', 'lookup']));

	// tags stored in the item property may require sorting. See #434
	const sortedTags = [...initialTags];
	sortByKey(sortedTags, 'tag');
	const [tags, setTags] = useState(sortedTags.map(t => ({ ...t, id: ++nextId })));

	const isPendingTagChanges = useSelector(state =>
		(get(state, ['libraries', state.current.libraryKey, 'updating', 'items', state.current.itemKey]) || [])
			.some(({ patch }) => 'tags' in patch)
	);
	const [tagRedacted, setTagRedacted] = useState(null);
	const [suggestions, setSuggestions] = useState([]);
	const requestId = useRef(1);
	const addTagRef = useRef(null);
	const scrollContainerRef = useRef(null);
	const { receiveBlur, receiveFocus, focusNext, focusPrev, focusBySelector,
		focusOnLast, resetLastFocused } = useFocusManager(scrollContainerRef, { isCarousel: false });
	const prevInitialTags = usePrevious(initialTags);
	const realTagCount = tags.filter(t => t.tag !== '').length;


	const handleCommit = useCallback(async (newTagValue, hasChanged, _ev, input) => {
		const tag = input.closest('[data-tag]').dataset.tag;
		setTagRedacted(null);
		setSuggestions([]);
		requestId.current += 1;

		if (!hasChanged) {
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

		if (tag === '') {
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

		if (tagRedacted === '') {
			setTimeout(() => { addTagRef.current.focus(); });
		} else {
			setTimeout(() => { focusOnLast(); });
		}
	}, [focusOnLast, tagRedacted, tags]);

	const handleEditableBlur = useCallback(() => {
		return false;
	}, []);

	const handleEdit = useCallback(ev => {
		if (isReadOnly) {
			return;
		}
		const tag = ev.currentTarget.closest('[data-tag]').dataset.tag;
		setTagRedacted(tag);
	}, [isReadOnly]);

	const handleDelete = useCallback(ev => {
		const tagEl = ev.currentTarget.closest('[data-tag]');
		const otherTagEl = tagEl.previousElementSibling || tagEl.nextElementSibling;
		const tag = tagEl.dataset.tag;
		const otherTag = otherTagEl ? otherTagEl.dataset.tag : null;
		const updatedTags = tags.filter(t => t.tag !== tag);
		setTags(updatedTags);
		dispatch(updateItem(itemKey, { tags: updatedTags.map(t => pick(t, ['tag'])) }));
		if(otherTag) {
			// wait for setTags to complete, then move focus to the previous/next tag
			setTimeout(() => focusBySelector(`[data-tag="${otherTag}"]`), 0);
		} else {
			addTagRef.current.focus();
		}
	}, [dispatch, focusBySelector, itemKey, tags]);

	const handleAddTag = useCallback(() => {
		setTags([...tags.filter(t => t.tag !== ''), { tag: '', id: ++nextId }]);
		setTagRedacted('');
	}, [tags]);

	const handleChange = useCallback(async newValue => {
		requestId.current += 1;
		const currentRequest = requestId.current;
		if (newValue.length > 0) {
			const rawSuggestions = await dispatch(fetchTagSuggestions(newValue));
			if (currentRequest !== requestId.current) {
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
		if (ev.target.nodeName === 'INPUT') {
			return;
		}
		if (ev.key === 'ArrowDown') {
			const isAddButton = ev.currentTarget === addTagRef.current;
			const isShift = ev.getModifierState('Shift');
			if (isAddButton && !isShift && ev.target === ev.currentTarget) {
				resetLastFocused();
				scrollContainerRef.current?.focus();
			} else {
				ev.target === ev.currentTarget && focusNext(ev);
			}
		} else if (ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && focusPrev(ev, { targetEnd: addTagRef.current });
		} else if (isTriggerEvent(ev)) {
			const isAddButton = ev.currentTarget === addTagRef.current;
			if (!isAddButton && ev.currentTarget === ev.target && ev.target.dataset.tag && !isReadOnly) {
				setTagRedacted(ev.target.dataset.tag);
			}
		} else if (ev.key === 'Home') {
			resetLastFocused();
			addTagRef.current.focus();
			ev.preventDefault();
		} else if (ev.key === 'End') {
			focusBySelector('.tag:last-child');
			ev.preventDefault();
		} else if (ev.key === 'PageDown' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.tag');
			focusNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if (ev.key === 'PageUp' && scrollContainerRef.current) {
			const containerEl = scrollContainerRef.current;
			const itemEl = containerEl.querySelector('.tag');
			focusPrev(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		}
	}, [focusBySelector, focusNext, focusPrev, isReadOnly, resetLastFocused]);

	const handleFocusOnContainer = useCallback(ev => {
		if (ev.target.nodeName === 'INPUT' || isTouchOrSmall) {
			return;
		}
		receiveFocus(ev);
	}, [receiveFocus, isTouchOrSmall]);

	useEffect(() => {
		if (isPendingTagChanges || tagRedacted !== null) {
			// if currently editing or updating tags, discard any remote updates to keep editing smooth
			// otherwise each intermediatry state will flash back when quickly adding or removing tags
			return;
		}
		if (typeof (prevInitialTags) !== 'undefined' && !deepEqual(initialTags, prevInitialTags)) {
			setTags(initialTags.map(t => ({ ...t, id: ++nextId })));
			// wait for setTags to complete, then refocus on the last focused tag (node will be gone but it will use index among candidates)
			setTimeout(focusOnLast, 0);
		}
	}, [isPendingTagChanges, tagRedacted, initialTags, prevInitialTags, focusOnLast]);

	return (
		<>
			{!isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-left">
						<div className="counter">
							{`${realTagCount} ${pluralize('tag', realTagCount)}`}
						</div>
						{!isReadOnly && (
							<ToolGroup>
								<Button
									className="btn-default add-tag"
									disabled={tagRedacted !== null}
									onClick={handleAddTag}
									onKeyDown={handleKeyDown}
									ref={addTagRef}
									tabIndex={0}
								>
									Add Tag
								</Button>
							</ToolGroup>
						)}
					</div>
				</Toolbar>
			)}
			<div
				className="scroll-container-mouse"
				onBlur={isTouchOrSmall ? noop : receiveBlur}
				onFocus={handleFocusOnContainer}
				ref={scrollContainerRef}
				tabIndex={0}
			>
				{tags.length > 0 && (
					<nav>
						<ul aria-label="Tags" className="details-list tag-list">
							{
								tags.map(tag => (
									<TagPickerItem
										key={tag.id}
										isReadOnly={isReadOnly}
										onCancel={handleCancel}
										onChange={handleChange}
										onCommit={handleCommit}
										onDelete={handleDelete}
										onEdit={handleEdit}
										onEditableBlur={handleEditableBlur}
										onKeyDown={handleKeyDown}
										suggestions={suggestions}
										tag={tag}
										tagColors={tagColors}
										tagRedacted={tagRedacted}
									/>
								))
							}
						</ul>
					</nav>
				)}
				{isTouchOrSmall && !isReadOnly && (
					<Button
						onClick={handleAddTag}
						className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
					>
						<Icon type={'24/plus-circle-strong'} width="24" height="24" />
						Add Tag
					</Button>
				)}
			</div>
		</>
	);
}

TagPicker.propTypes = {
	isReadOnly: PropTypes.bool,
	itemKey: PropTypes.string.isRequired,
	libraryKey: PropTypes.string.isRequired,
}

export default memo(TagPicker);
