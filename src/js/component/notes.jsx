'use strict';

import PropTypes from 'prop-types';
import React from 'react';

import Button from './ui/button';
import Icon from './ui/icon';
import Modal from './ui/modal';
import Note from './note';
import RichEditor from './rich-editor';
import withDevice from '../enhancers/with-device';
import withEditMode from '../enhancers/with-edit-mode';
import { pick } from '../common/immutable';
import { Toolbar, ToolGroup } from './ui/toolbars';

class Notes extends React.PureComponent {
	state = {
		isModalVisible: false,
		selected: null
	};

	handleSelect = note => {
		const { device } = this.props;
		this.setState({ selected: note.key });
		if(device.isTouchOrSmall) {
			this.setState({  isModalVisible: true });
		}
	}

	handleDelete = note => {
		if(this.state.selected === note.key) {
			this.setState({ selected: null });
		}
		this.props.onDeleteNote(note);
	}

	handleDuplicate = note => {
		this.props.onAddNote(note.note);
	}

	handleChangeNote = newContent => {
		const { updateItem } = this.props;
		updateItem(this.state.selected, { note: newContent });
	}

	handleAddNote = () => {
		this.props.onAddNote();
	}

	handleModalClose = () => {
		this.setState({ isModalVisible: false });
	}

	handleEditToggle = () => {
		const { isEditing, onEditModeToggle } = this.props;
		onEditModeToggle(!isEditing);
	}

	renderModal() {
		const { isModalVisible } = this.state;
		const { isEditing } = this.props;
		const selectedNote = this.props.notes.find(n => n.key == this.state.selected);

		return (
			<Modal
				isOpen={ isModalVisible }
				contentLabel="Edit Note"
				className="modal-touch modal-centered modal-form modal-notes"
				overlayClassName={ "modal-slide" }
				closeTimeoutMS={ 600 }
				onRequestClose={ this.handleModalClose }
			>
				<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					<div className="modal-header-left">
						<Button
							className="btn-link"
							onClick={ this.handleModalClose }
						>
							<Icon type={ '16/caret-16' } width="16" height="16" className="icon-previous" />
							<span className="btn-link-label">Notes</span>
						</Button>
					</div>
					<div className="modal-header-center" />
					<div className="modal-header-right">
						<Button
							className="btn-link"
							onClick={ this.handleEditToggle }
						>
							{ isEditing ? 'Done' : 'Edit' }
						</Button>
					</div>
				</div>
				<div className="modal-body">
					{ this.state.selected && selectedNote && (
						<RichEditor
							key={ this.state.selected }
							isReadOnly={ !isEditing }
							value={ this.props.notes.find(n => n.key == this.state.selected).note }
							onChange={ this.handleChangeNote }
						/>
					) }
				</div>
			</div>
			</Modal>
		);
	}

	render() {
		const { device, isReadOnly, notes } = this.props;
		const { selected } = this.state;
		const selectedNote = this.props.notes.find(n => n.key == this.state.selected);

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
											isSelected={ selected === note.key }
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
										className="btn-link"
										onClick={ this.handleAddNote }
										disabled={ isReadOnly }
									>
										<Icon type={ '16/plus' } width="16" height="16" />
										Add Note
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

				{ !device.isTouchOrSmall && this.state.selected && selectedNote && (
					<RichEditor
						key={ this.state.selected }
						isReadOnly={ isReadOnly }
						value={ selectedNote.note }
						onChange={ this.handleChangeNote }
					/>
				) }
			{ this.renderModal() }
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
