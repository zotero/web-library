import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import RichEditor from 'component/rich-editor';
import { get } from 'utils';
import { deleteUnusedEmbeddedImages, updateItem } from 'actions';
import { TabPane } from 'component/ui/tabs';
import { usePrepForUnmount } from '../../hooks';

const StandaloneNote = ({ isActive, isReadOnly }) => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);

	const handleNoteChange = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	usePrepForUnmount(lastSeenNoteKey => {
		dispatch(deleteUnusedEmbeddedImages(lastSeenNoteKey));
	}, itemKey);

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
		>
			<RichEditor
				autoresize={ shouldUseTabs ? false : true }
				id={ item.key }
				isReadOnly={ isReadOnly }
				onChange={ handleNoteChange }
				value={ item.note }
			/>
		</TabPane>
	);
}

StandaloneNote.propTypes = {
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default StandaloneNote;
