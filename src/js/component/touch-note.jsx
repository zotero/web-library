'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import RichEditor from './rich-editor';
import cx from 'classnames';

const TouchNote = ({ note, isEditing, updateItem }) => {

	const handleNoteChange = content => {
		updateItem(note.key, { note: content });
	}

	const className = cx({
		'rich-editor-container hidden-mouse': true,
		'editing': isEditing
	})

	console.log(note);

	return (
		<section className={ className }>
			{ note && (
				<RichEditor
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
