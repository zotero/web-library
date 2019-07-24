'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import RichEditorContainer from '../container/rich-editor';
import cx from 'classnames';

const TouchNote = ({ note, isEditing, updateItem }) => {

	const handleNoteChange = content => {
		updateItem(note.key, { note: content });
	}

	const className = cx({
		'rich-editor-container hidden-mouse': true,
		'editing': isEditing
	})

	return (
		<section className={ className }>
			{ note && (
				<RichEditorContainer
					key={ note.key }
					isReadOnly={ !isEditing }
					value={ note.note }
					onChange={ handleNoteChange }
				/>
			)}
		</section>
	);
}


TouchNote.propTypes = {
	note: PropTypes.object,
	isEditing: PropTypes.bool,
	updateItem: PropTypes.func.isRequired
}

export default TouchNote;
