'use strict';

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import RichEditor from '../component/rich-editor';
import cx from 'classnames';

const TouchNote = ({ note, isEditing, updateItem }) => {

	const handleNoteChange = useCallback(content => {
		updateItem(note.key, { note: content });
	});

	const className = cx({
		'rich-editor-container hidden-mouse': true,
		'editing': isEditing
	});

	return (
		<section className={ className }>
			{ note && (
				<RichEditor
					id={ note.key }
					isReadOnly={ !isEditing }
					onChange={ handleNoteChange }
					value={ note.note }
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
