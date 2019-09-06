import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import cx from 'classnames';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';


import Button from '../ui/button';
import Icon from '../ui/icon';
import RichEditorContainer from '../../container/rich-editor';
import withDevice from '../../enhancers/with-device';
import withEditMode from '../../enhancers/with-edit-mode';
import { isTriggerEvent } from '../../common/event';
import { noteAsTitle } from '../../common/format';
import { sortByKey, stopPropagation } from '../../utils';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';

const PAGE_SIZE = 100;

const Note = props => {
	const { device, isSelected, isReadOnly, note, onDelete, onDuplicate, onSelect } = props;
	const [isDropdownOpen, setDropdownOpen] = useState(false);

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

	return (
		<li
			className={ cx('note', { 'selected': isSelected }) }
			onClick={ handleSelect }
			onKeyDown={ handleSelect }
			tabIndex={ 0 }
		>
			<Icon type={ '28/note'} width="28" height="28" className="hidden-mouse" />
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
}

Note.propTypes = {
	device: PropTypes.object,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	note: PropTypes.object,
	onDelete: PropTypes.func,
	onDuplicate: PropTypes.func,
	onSelect: PropTypes.func,
}

const Notes = props => {
	const { device, childItems, isActive, isFetching, isFetched, updateItem, navigate,
	fetchItemTemplate, isReadOnly, isTinymceFetched, isTinymceFetching, itemKey, noteKey,
	createItem, libraryKey, deleteItem, pointer, sourceFile, fetchChildItems } = props;

	const [notes, setNotes] = useState([]);

	const editorRef = useRef();
	const addedNoteKey = useRef();

	const selectedNote = useMemo(
		() => childItems.find(n => n.key === noteKey),
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

	const handleChangeNote = newContent => {
		updateItem(noteKey, { note: newContent });
	}

	const handleSelect = note => {
		navigate({ noteKey: note.key });
	}

	const handleDelete = note => {
		deleteItem(note);
		navigate({ note: null });
	}

	const handleDuplicate = async note => {
		const noteTemplate = await fetchItemTemplate('note');
		const item = { ...noteTemplate, parentItem: itemKey, note: note.note };
		const createdItem = await createItem(item, libraryKey);
		addedNoteKey.current = createdItem.key;
		navigate({ noteKey: createdItem.key });
	}

	const handleAddNote = async () => {
		const noteTemplate = await fetchItemTemplate('note');
		const item = { ...noteTemplate, parentItem: itemKey, note: '' };
		const createdItem = await createItem(item, libraryKey);
		addedNoteKey.current = createdItem.key;
		navigate({ noteKey: createdItem.key });
	}

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ device.shouldUseTabs && !isFetched }
		>
			<h5 className="h2 tab-pane-heading hidden-mouse">Notes</h5>
			<div className="scroll-container-mouse">
				<nav>
					<ul className="note-list">
						{
							notes.map(note => {
								return (
									<Note
										device={ device }
										isReadOnly={ isReadOnly }
										isSelected={ noteKey === note.key }
										key={ note.key }
										note={ note }
										onDelete={ handleDelete }
										onDuplicate={ handleDuplicate }
										onSelect={ handleSelect }
									/>
								);
							})
						}
					</ul>
				</nav>
				{ !device.isTouchOrSmall && (
					<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<Button
									className="btn-link icon-left"
									onClick={ handleAddNote }
									disabled={ isReadOnly }
								>
									<span className="flex-row align-items-center">
										<Icon type={ '16/plus' } width="16" height="16" />
										Add Note
									</span>
								</Button>
							</ToolGroup>
						</div>
					</Toolbar>
				) }
				{ device.isTouchOrSmall && !isReadOnly && (
					<Button
						onClick={ handleAddNote }
						className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
					>
						<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
						Add Note
					</Button>
				)}
			</div>

			{ !device.isTouchOrSmall && selectedNote && (
				<RichEditorContainer
					ref={ editorRef }
					key={ selectedNote.key }
					isReadOnly={ isReadOnly }
					value={ selectedNote.note }
					onChange={ handleChangeNote }
				/>
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

export default  withDevice(withEditMode(Notes));
