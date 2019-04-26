/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import { noteAsTitle } from '../common/format';
import { get } from '../utils';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Icon from './ui/icon';
import Button from './ui/button';
import RichEditor from './rich-editor';

class Notes extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
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

	handleEditNote(note) {
		const { isReadOnly } = this.props;
		if(!isReadOnly) {
			this.setState({ selected: note.key });
		}
	}

	handleChangeNote(note) {
		this.props.onChange(this.state.selected, note);
	}

	handleAddNote() {
		this.props.onAddNote();
	}

	handleDelete() {
		let note = this.props.notes.find(n => n.key == this.state.selected);
		this.props.onDeleteNote(note);
	}

	handleDuplicate() {
		let note = this.props.notes.find(n => n.key == this.state.selected);
		this.props.onAddNote(note.note);
	}

	handleToggleDropdown() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	}

	renderRichEditor() {
		return (
			<div className="editor">
				<RichEditor
					value={ this.props.notes.find(n => n.key == this.state.selected).note }
					onChange={ this.handleChangeNote.bind(this) }
				/>
			</div>
		);
	}

	render() {
		const { isReadOnly } = this.props;

		return (
			<div className="details-list notes">
				<nav>
					<ul className="nav list">
						{
							this.props.notes.map(note => {
								return (
									<li
										className={ cx('item', {'selected': this.state.selected == note.key }) }
										key={ note.key }
										onClick={ ev => this.handleEditNote(note, ev) }
									>
										<Icon type={ '16/item-types/note' } width="16" height="16" />
										<a>
											{ note.note && noteAsTitle(note.note) || <em>Untitled Note</em> }
										</a>
									</li>
								);
							})
						}
					</ul>
				</nav>

				{ this.state.selected && this.renderRichEditor() }

				{ !isReadOnly && (
					<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<Button icon onClick={ this.handleAddNote.bind(this) }>
									<Icon type={ '16/plus' } width="16" height="16" />
								</Button>
								{
									this.state.selected &&
									<Dropdown
										isOpen={ this.state.isOpen }
										toggle={ this.handleToggleDropdown.bind(this) }
										className="dropdown-wrapper"
									>
										<DropdownToggle
											color={ null }
											className="btn-icon dropdown-toggle"
										>
											<Icon type={ '16/cog' } width="16" height="16" />
										</DropdownToggle>
										<DropdownMenu>
											<DropdownItem onClick={ this.handleDuplicate.bind(this) }>
												Duplicate
											</DropdownItem>
											<DropdownItem onClick={ this.handleDelete.bind(this) }>
												Delete
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								}
							</ToolGroup>
						</div>
					</Toolbar>
				)}
			</div>
		);
	}
}

Notes.propTypes = {
	notes: PropTypes.array
};

Notes.defaultProps = {
	notes: []
};

export default Notes;
