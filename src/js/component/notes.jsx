/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;
const { noteAsTitle } = require('../common/format');
const { get } = require('../utils');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');
const RichEditor = require('./rich-editor');

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
		this.setState({
			selected: note.key
		});
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

	get richEditor() {
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

				{ this.state.selected && this.richEditor }

				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button onClick={ this.handleAddNote.bind(this) }>
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

module.exports = Notes;
