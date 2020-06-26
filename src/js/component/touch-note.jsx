import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import RichEditor from '../component/rich-editor';
import cx from 'classnames';
import { get } from '../utils';
import { updateItem } from '../actions';
import { useEditMode } from '../hooks';

const TouchNote = () => {
	const dispatch = useDispatch();
	const note = useSelector(state => get(state, [
		'libraries', state.current.libraryKey, 'items', state.current.noteKey
	], null));
	const [isEditing, ] = useEditMode();

	const handleNoteChange = useCallback((content, key) => {
		dispatch(updateItem(key, { note: content }));
	}, [dispatch]);

	const className = cx({
		'editing': isEditing,
		'hidden-mouse': true,
		'touch-details-drilldown': true,
		'touch-note': true,
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

export default TouchNote;
