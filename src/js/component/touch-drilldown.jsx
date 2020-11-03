import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AttachmentDetails from '../component/item-details/attachment-details';
import cx from 'classnames';
import RichEditor from '../component/rich-editor';
import { get } from '../utils';
import { updateItem } from '../actions';
import { useEditMode } from '../hooks';

const TouchDrilldown = memo(() => {
	const dispatch = useDispatch();
	const attachmentKey = useSelector(state => state.current.attachmentKey);
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
		'touch-attachment': attachmentKey !== null,
		'touch-note': note !== null,
		'touch-details-drilldown': true,
	});

	return (
		<section className={ className }>
			{ attachmentKey ? (
				<AttachmentDetails
					isReadOnly={ !isEditing }
					attachmentKey={ attachmentKey }
				/>
			) : note && (
				<RichEditor
					id={ note.key }
					isReadOnly={ !isEditing }
					onChange={ handleNoteChange }
					value={ note.note }
				/>
			) }
		</section>
	);
});


export default TouchDrilldown;
