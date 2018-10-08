'use strict';

const React = require('react');
const cx = require('classnames');
const Notes = require('../../../notes');

class NotesTabPane extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'notes': true,
				'active': this.props.isActive
			}) }>
				<h5 className="h2 tab-pane-heading">Notes</h5>
				<Notes
					item={ this.props.item }
					notes={ this.props.childItems.filter(i => i.itemType === 'note') }
					onChange={ this.props.onNoteChange }
					onAddNote={ this.props.onAddNote }
					onDeleteNote={ this.props.onDeleteNote }
				/>
			</div>
		);
	}

	static defaultProps = {
		childItems: []
	}
}

module.exports = NotesTabPane;
