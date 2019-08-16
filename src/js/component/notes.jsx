'use strict';

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import Button from './ui/button';
import Icon from './ui/icon';
import Note from './note';
import RichEditorContainer from '../container/rich-editor';
import withEditMode from '../enhancers/with-edit-mode';
import { Toolbar, ToolGroup } from './ui/toolbars';
import { TabPane } from './ui/tabs';

const PAGE_SIZE = 100;

const Notes = ({ device, childItems, isActive, isFetching, isFetched,
	updateItem, navigate, fetchItemTemplate, isReadOnly, itemKey, noteKey, createItem,
	libraryKey, deleteItem, pointer, fetchChildItems }) => {

	useEffect(() => {
		if(isActive && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			fetchChildItems(itemKey, { start, limit });
		}
	}, [isActive, isFetching, isFetched, childItems]);

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
		await createItem(item, libraryKey);
	}

	const handleAddNote = async () => {
		const noteTemplate = await fetchItemTemplate('note');
		const item = { ...noteTemplate, parentItem: itemKey, note: '' };
		await createItem(item, libraryKey);
	}

	const selectedNote = childItems.find(n => n.key === noteKey);

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ typeof(isFetching) === 'undefined' ? true : isFetching }
		>
			<div className="scroll-container-mouse">
				<nav>
					<ul className="note-list">
						{
							childItems.filter(i => i.itemType === 'note').map(note => {
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
	itemKey: PropTypes.string,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func,
	noteKey: PropTypes.string,
	pointer: PropTypes.number,
	updateItem: PropTypes.func,
}

export default  withEditMode(Notes);
