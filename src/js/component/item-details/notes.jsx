import cx from 'classnames';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../ui/button';
import Icon from '../ui/icon';
import RichEditor from '../../component/rich-editor';
import withDevice from '../../enhancers/with-device';
import withEditMode from '../../enhancers/with-edit-mode';

import { get, scrollIntoViewIfNeeded } from '../../utils';
import { isTriggerEvent } from '../../common/event';
import { noteAsTitle, pluralize } from '../../common/format';
import { getScrollContainerPageCount, sortByKey, stopPropagation } from '../../utils';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';
import { useFocusManager } from '../../hooks';
import { navigate } from '../../actions';

const PAGE_SIZE = 100;

//@TODO: convert to useDispatch hook
const Note = forwardRef((props, ref) => {
	const { device, deleteItem, isReadOnly, noteKey, onDelete, onDuplicate, onSelect, onKeyDown } = props;
	const dispatch = useDispatch();
	const [isDropdownOpen, setDropdownOpen] = useState(false);

	const { note, isUpdating, isSelected } = useSelector(state => ({
		note: get(state, ['libraries', state.current.libraryKey, 'items', noteKey], {}),
		isUpdating: noteKey in get(state, ['libraries', state.current.libraryKey, 'updating', 'items'], {}),
		isSelected: noteKey === state.current.noteKey
	}));

	useEffect(() => {
		if(!isSelected && !isUpdating && note.note === '') {
			deleteItem(note);
		}
	}, [isSelected]);

	const handleToggleDropdown = useCallback(() => setDropdownOpen(!isDropdownOpen));

	const handleSelect = useCallback(ev => {
		if(isTriggerEvent(ev)) { onSelect(note) }
	});

	const handleDelete = useCallback(ev => {
		onDelete(note);
		ev.stopPropagation();
	});

	const handleDuplicate = useCallback(ev => {
		onDuplicate(note);
		ev.stopPropagation();
	});

	const handleFocus = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		dispatch(navigate({ noteKey: note.key }));
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape' && isDropdownOpen) {
			// Escape should not move focus back to the list in this case
			ev.stopPropagation();
		}
		onKeyDown(ev);
	});

	return (
		<li
			className={ cx('note', { 'selected': isSelected }) }
			onClick={ handleSelect }
			onKeyDown={ handleKeyDown }
			tabIndex={ -2 }
			data-key={ note.key }
			ref={ ref }
			onFocus={ handleFocus }
		>
			<Icon type={ '28/item-types/light/note'} width="28" height="28" className="hidden-mouse" />
			<div className="multiline-truncate">
				{ note.note && noteAsTitle(note.note) || <em>Untitled Note</em> }
			</div>
			{ !isReadOnly && (
				<Dropdown
					isOpen={ isDropdownOpen }
					toggle={ handleToggleDropdown }
				>
					<DropdownToggle
						color={ null }
						tabIndex={ -3 }
						onClick={ stopPropagation }
						className={ cx('dropdown-toggle', {
							'btn-circle btn-secondary': device.isTouchOrSmall,
							'btn-icon': !device.isTouchOrSmall,
						})}
					>
						<Icon
							type={ '16/options-strong' }
							width="16"
							height="16"
							className="touch"
						/>
						<Icon type={ '16/options' } width="16" height="16" className="mouse" />
					</DropdownToggle>
					<DropdownMenu right>
						<DropdownItem onClick={ handleDuplicate }>
							Duplicate
						</DropdownItem>
						<DropdownItem onClick={ handleDelete }>
							Delete
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			)}
			<Icon type={ '16/chevron-13' } width="16" height="16" className="hidden-mouse" />
		</li>
	);
});

Note.displayName = 'Note';

Note.propTypes = {
	device: PropTypes.object,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	noteKey: PropTypes.string,
	onDelete: PropTypes.func,
	onDuplicate: PropTypes.func,
	onSelect: PropTypes.func,
}

const Notes = props => {
	const { deleteItem, device, childItems, isActive, isFetching, isFetched, updateItem, navigate,
	fetchItemTemplate, isReadOnly, isTinymceFetched, isTinymceFetching, itemKey, moveToTrash,
	noteKey, createItem, libraryKey, pointer, sourceFile, fetchChildItems } = props;
	const editorRef = useRef();
	const addedNoteKey = useRef();
	const notesEl = useRef(null);
	const selectedNoteRef = useRef(null);
	const addNoteRef = useRef(null);
	const hasScrolledIntoViewRef = useRef(false);

	const { handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus,
		handleBlur, handleBySelector } = useFocusManager(notesEl, { overrideFocusRef:
		selectedNoteRef, isCarousel: false });

	const [notes, setNotes] = useState([]);

	const selectedNote = useMemo(
		() => childItems.find(n => n && n.key === noteKey),
		[childItems, noteKey]
	);

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			sourceFile('tinymce');
		}
	}, []);

	useEffect(() => {
		if(isActive && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			fetchChildItems(itemKey, { start, limit });
		}
	}, [isActive, isFetching, isFetched, childItems]);

	useEffect(() => {
		const notes = childItems.filter(i => i.itemType === 'note');
		sortByKey(notes, n => noteAsTitle(n.note));
		setNotes(notes);
	}, [childItems]);

	useEffect(() => {
		if(isActive && noteKey && editorRef.current && addedNoteKey.current === noteKey) {
			editorRef.current.focus();
			addedNoteKey.current = null;
		}
	}, [childItems]);

	// Scroll selected note into view when it's first ready.
	useEffect(() => {
		setTimeout(() => {
			if(!notesEl.current || !selectedNote) {
				return;
			}

			const selectedNoteEl = notesEl.current.querySelector(`[data-key="${selectedNote.key}"]`);

			if(selectedNoteEl && !hasScrolledIntoViewRef.current) {
				scrollIntoViewIfNeeded(selectedNoteEl, notesEl.current);
				hasScrolledIntoViewRef.current = true;
			}
		}, 0);
	}, [selectedNote]);

	const handleChangeNote = useCallback(newContent => {
		updateItem(noteKey, { note: newContent });
	});

	const handleSelect = useCallback(note => {
		navigate({ noteKey: note.key });
	});

	const handleDelete = useCallback(note => {
		moveToTrash([note.key]);
		navigate({ note: null });
	});

	const handleDuplicate = useCallback(async note => {
		const noteTemplate = await fetchItemTemplate('note');
		const item = { ...noteTemplate, parentItem: itemKey, note: note.note };
		const createdItem = await createItem(item, libraryKey);
		addedNoteKey.current = createdItem.key;
		navigate({ noteKey: createdItem.key });
	});

	const handleAddNote = useCallback(async () => {
		const noteTemplate = await fetchItemTemplate('note');
		const item = { ...noteTemplate, parentItem: itemKey, note: '' };
		const createdItem = await createItem(item, libraryKey);
		addedNoteKey.current = createdItem.key;
		navigate({ noteKey: createdItem.key });
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			handleDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			handleDrillDownNext(ev);
		} else if(ev.key === 'ArrowDown') {
			ev.target === ev.currentTarget && handleNext(ev);
		} else if(ev.key === 'ArrowUp') {
			ev.target === ev.currentTarget && handlePrevious(ev, { targetEnd: addNoteRef.current });
		} else if(ev.key === 'Home') {
			addNoteRef.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			handleBySelector('.note:last-child');
			ev.preventDefault();
		} else if(ev.key === 'PageDown' && notesEl.current) {
			const containerEl = notesEl.current;
			const itemEl = containerEl.querySelector('.note');
			handleNext(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'PageUp' && notesEl.current) {
			const containerEl = notesEl.current;
			const itemEl = containerEl.querySelector('.note');
			handlePrevious(ev, { offset: getScrollContainerPageCount(itemEl, containerEl) });
			ev.preventDefault();
		} else if(ev.key === 'Tab') {
			const isFileInput = ev.currentTarget === addNoteRef.current;
			const isShift = ev.getModifierState('Shift');
			if(isFileInput && !isShift) {
				ev.target === ev.currentTarget && handleNext(ev);
			}
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
			ev.preventDefault();
		}
	});

	const handleButtonKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowDown') {
			notesEl.current.focus();
			ev.preventDefault();
		} else if(ev.key === 'End') {
			handleBySelector('.note:last-child');
			ev.preventDefault();
		}
	});

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !isFetched }
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Notes</h5>
			{ !device.isTouchOrSmall && (
				<Toolbar>
					<div className="toolbar-left">
						<div className="counter">
							{ `${notes.length} ${pluralize('note', notes.length)}` }
						</div>
						{ !isReadOnly && (
						<ToolGroup>
							<Button
								className="btn-default"
								disabled={ isReadOnly }
								onClick={ handleAddNote }
								onKeyDown={ handleButtonKeyDown }
								ref={ addNoteRef }
								tabIndex="0"
							>
								Add Note
							</Button>
						</ToolGroup>
						) }
					</div>
				</Toolbar>
			)}
			<div
				className="scroll-container-mouse"
				onBlur={ handleBlur }
				onFocus={ handleFocus }
				ref={ notesEl }
				tabIndex={ 0 }
			>
				{ notes.length > 0 && (
					<nav>
						<ul className="note-list" >
							{
								notes.map(note => {
									return (
										<Note
											device={ device }
											isReadOnly={ isReadOnly }
											key={ note.key }
											noteKey={ note.key }
											onDelete={ handleDelete }
											onDuplicate={ handleDuplicate }
											onSelect={ handleSelect }
											deleteItem={ deleteItem }
											onKeyDown={ handleKeyDown }
											ref={ noteKey === note.key ? selectedNoteRef : null }
										/>
									);
								})
							}
						</ul>
					</nav>
				) }
			</div>
			{ device.isTouchOrSmall && !isReadOnly && (
				<Button
					onClick={ handleAddNote }
					className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
				>
					<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
					Add Note
				</Button>
			)}

			{ !device.isTouchOrSmall && selectedNote && (
				<RichEditor
					id={ noteKey }
					isReadOnly={ isReadOnly }
					onChange={ handleChangeNote }
					ref={ editorRef }
					value={ selectedNote.note }
				/>
			) }
			{ !device.isTouchOrSmall && !selectedNote && notes.length > 0 && (
				<div className="no-selection-placeholder">
					No note selected
				</div>
			) }
		</TabPane>
	);
}

Notes.propTypes = {
	childItems: PropTypes.array,
	createItem: PropTypes.func,
	deleteItem: PropTypes.func,
	device: PropTypes.object,
	fetchChildItems: PropTypes.func,
	fetchItemTemplate: PropTypes.func,
	isActive: PropTypes.bool,
	isFetched: PropTypes.bool,
	isFetching: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isTinymceFetched: PropTypes.bool,
	isTinymceFetching: PropTypes.bool,
	itemKey: PropTypes.string,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func,
	noteKey: PropTypes.string,
	pointer: PropTypes.number,
	sourceFile: PropTypes.func,
	updateItem: PropTypes.func,
}

export default withDevice(withEditMode(Notes));
