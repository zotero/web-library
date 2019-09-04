import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
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
import { sortByKey } from '../../utils';
import { TabPane } from '../ui/tabs';
import { Toolbar, ToolGroup } from '../ui/toolbars';

const PAGE_SIZE = 100;

class Note extends React.PureComponent {
	state = { isOpen: false }
	handleToggleDropdown = () => this.setState({ isOpen: !this.state.isOpen })
	handleSelect = ev => {
		const { note, onSelect } = this.props;
		if(isTriggerEvent(ev)) { onSelect(note) }
	}
	handleDelete = ev => {
		const { note, onDelete } = this.props;
		onDelete(note);
		ev.stopPropagation();
	}
	handleDuplicate = ev => {
		const { note, onDuplicate } = this.props;
		onDuplicate(note);
		ev.stopPropagation();
	}
	handleToggleDropdownClick = ev => {
		ev.stopPropagation();
	}
	render() {
		const { device, isSelected, isReadOnly, note } = this.props;
		const { isOpen } = this.state;
		return (
			<li
				className={ cx('note', { 'selected': isSelected }) }
				onClick={ this.handleSelect }
				onKeyDown={ this.handleSelect }
				tabIndex={ 0 }
			>
				<Icon type={ '28/note'} width="28" height="28" className="hidden-mouse" />
				<div className="multiline-truncate">
					{ note.note && noteAsTitle(note.note) || <em>Untitled Note</em> }
				</div>
				{ !isReadOnly && (
					<Dropdown
						isOpen={ isOpen }
						toggle={ this.handleToggleDropdown }
					>
						<DropdownToggle
							color={ null }
							onClick={ this.handleToggleDropdownClick }
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
							<DropdownItem onClick={ this.handleDuplicate }>
								Duplicate
							</DropdownItem>
							<DropdownItem onClick={ this.handleDelete }>
								Delete
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				)}
				<Icon type={ '16/chevron-13' } width="16" height="16" className="hidden-mouse" />
			</li>
		);
	}

	static propTypes = {
		device: PropTypes.object,
		isReadOnly: PropTypes.bool,
		isSelected: PropTypes.bool,
		note: PropTypes.object,
		onDelete: PropTypes.func,
		onDuplicate: PropTypes.func,
		onSelect: PropTypes.func,
	}
}

const Notes = ({ device, childItems, isActive, isFetching, isFetched,
	updateItem, navigate, fetchItemTemplate, isReadOnly, isTinymceFetched,
	isTinymceFetching, itemKey, noteKey, createItem, libraryKey, deleteItem,
	pointer, sourceFile, fetchChildItems }) => {

	const [notes, setNotes] = useState([]);

	const editorRef = useRef();
	const addedNoteKey = useRef();

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

	const selectedNote = childItems.find(n => n.key === noteKey);

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
