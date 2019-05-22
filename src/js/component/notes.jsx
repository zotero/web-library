/* eslint-disable react/no-deprecated */
'use strict';

import PropTypes from 'prop-types';
import React from 'react';

import Button from './ui/button';
import Icon from './ui/icon';
import Note from './note';
import RichEditor from './rich-editor';
import { get } from '../utils';
import { pick } from '../common/immutable';
import { Toolbar, ToolGroup } from './ui/toolbars';

class Notes extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			selected: null
		};
	}

	componentWillReceiveProps(props) {
		const itemKey = get(props, 'item.key');
		if(itemKey && get(this.props, 'item.key') !== itemKey) {
			this.setState({
				selected: null
			});
		}

		if(!props.notes.find(n => n.key == this.state.selected)) {
			this.setState({
				selected: null
			});
		}
	}

	handleSelect = note => {
		this.setState({ selected: note.key });
	}

	handleDelete = note => {
		this.props.onDeleteNote(note);
	}

	handleDuplicate = note => {
		this.props.onAddNote(note.note);
	}

	handleChangeNote = newContent => {
		const { updateItem } = this.props;
		updateItem(this.state.selected, { note: newContent });
	}

	handleAddNote() {
		this.props.onAddNote();
	}

	renderRichEditor() {
		const { isReadOnly } = this.props;
		return (
			<RichEditor
				key={ this.state.selected }
				isReadOnly={ isReadOnly }
				value={ this.props.notes.find(n => n.key == this.state.selected).note }
				onChange={ this.handleChangeNote }
			/>
		);
	}

	render() {
		const { isReadOnly, notes } = this.props;
		const { selected } = this.state;

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
					{ !isReadOnly && (
						<Button
							className="btn-block text-left hairline-top hairline-start-icon-28 btn-transparent-secondary"
						>
							<Icon type={ '24/plus-circle-strong' } width="24" height="24" />
							Add Note
						</Button>

						/*<Toolbar>
							<div className="toolbar-left">
								<ToolGroup>
									<Button
										className="btn-link"
										onClick={ this.handleAddNote.bind(this) }
									>
										<Icon type={ '16/plus' } width="16" height="16" />
										Add Note
									</Button>
								</ToolGroup>
							</div>
						</Toolbar>*/
					)}
				</div>

				{ this.state.selected && this.renderRichEditor() }
			</React.Fragment>
		);
	}

	static propTypes = {
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

export default Notes;
