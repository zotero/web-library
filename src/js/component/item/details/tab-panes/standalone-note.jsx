'use strict';

import React from 'react';
import cx from 'classnames';
import RichEditorContainer from '../../../../container/rich-editor';

class StandaloneNoteTabPane extends React.PureComponent {
	handleChangeNote(note) {
		this.props.onNoteChange(this.props.item.key, note);
	}

	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'notes': true,
				'active': this.props.isActive
			}) }>
				<div className="editor">
				<RichEditorContainer
					value={ this.props.item.note }
					onChange={ this.handleChangeNote.bind(this) }
				/>
			</div>
			</div>
		);
	}
}

export default StandaloneNoteTabPane;
