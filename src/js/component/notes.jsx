'use strict';

import PropTypes from 'prop-types';
import React from 'react';

import Button from './ui/button';
import Icon from './ui/icon';
import Modal from './ui/modal';
import Note from './note';
import RichEditorContainer from '../container/rich-editor';
import withEditMode from '../enhancers/with-edit-mode';
import { pick } from '../common/immutable';
import { Toolbar, ToolGroup } from './ui/toolbars';

class Notes extends React.PureComponent {
	handleSelect = note => {
		const { navigate } = this.props;
		navigate({ noteKey: note.key });
	}

	handleDelete = note => {
		const { navigate } = this.props;
		this.props.onDeleteNote(note);
		navigate({ note: null });
	}

	handleDuplicate = note => {
		this.props.onAddNote(note.note);
	}

	handleChangeNote = newContent => {
		const { noteKey, updateItem } = this.props;
		updateItem(noteKey, { note: newContent });
	}

	handleAddNote = () => {
		this.props.onAddNote();
	}

	handleEditToggle = () => {
		const { isEditing, onEditModeToggle } = this.props;
		onEditModeToggle(!isEditing);
	}

	render() {
		const { device, isReadOnly, notes, noteKey } = this.props;
		const selectedNote = this.props.notes.find(n => n.key === noteKey);

		return (
			<React.Fragment>
				<div className="scroll-container-mouse">
					<nav>
						<ul className="note-list">
							{
								notes.map(note => {
									return (
										<Note
											{ ...pick(
												this.props, ['device', 'isReadOnly']
											)}
											isSelected={ noteKey === note.key }
											key={ note.key }
											note={ note }
											onDelete={ this.handleDelete }
											onDuplicate={ this.handleDuplicate }
											onSelect={ this.handleSelect }
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
										onClick={ this.handleAddNote }
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
							onClick={ this.handleAddNote }
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
						onChange={ this.handleChangeNote }
					/>
				) }
			</React.Fragment>
		);
	}

	static propTypes = {
		device: PropTypes.object,
		isReadOnly: PropTypes.bool,
		notes: PropTypes.array,
		onAddNote: PropTypes.func,
		onChange: PropTypes.func,
		onDeleteNote: PropTypes.func,
		updateItem: PropTypes.func,
	}

	static defaultProps = {
		notes: []
	};
}

export default withEditMode(Notes);
