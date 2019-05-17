'use strict';

import cx from 'classnames';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './ui/icon';
import { noteAsTitle } from '../common/format';

class Note extends React.PureComponent {
	state = { isOpen: false }
	handleToggleDropdown = () => this.setState({ isOpen: !this.state.isOpen })
	handleSelect = () => {
		const { note, onSelect } = this.props;
		onSelect(note);
	}
	handleDelete = () => {
		const { note, onDelete } = this.props;
		onDelete(note);
	}
	handleDuplicate = () => {
		const { note, onDuplicate } = this.props;
		onDuplicate(note);
	}
	render() {
		const { isSelected, isReadOnly, note } = this.props;
		return (
			<li
				className={ cx('note', { 'selected': isSelected }) }
				onClick={ this.handleSelect }
			>
				<Icon type={ '28/note'} width="28" height="28" className="hidden-mouse" />
				<div className="multiline-truncate">
					{ note.note && noteAsTitle(note.note) || <em>Untitled Note</em> }
				</div>
				{ !isReadOnly && (
					<Dropdown
						isOpen={ this.state.isOpen }
						toggle={ this.handleToggleDropdown }
						className="dropdown-wrapper"
					>
						<DropdownToggle
							color={ null }
							className="btn-icon dropdown-toggle"
						>
							<Icon type={ '16/options' } width="16" height="16" />
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem onClick={ this.handleDuplicate }>
								Duplicate
							</DropdownItem>
							<DropdownItem onClick={ this.handleDelete }>
								Delete
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				)}
			</li>
		);
	}

	static propTypes = {
		isReadOnly: PropTypes.bool,
		isSelected: PropTypes.bool,
		note: PropTypes.object,
		onDelete: PropTypes.func,
		onDuplicate: PropTypes.func,
		onSelect: PropTypes.func,
	}
}

export default Note;
