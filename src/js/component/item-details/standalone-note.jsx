import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import RichEditor from 'component/rich-editor';
import { get } from 'utils';
import { sourceFile, updateItem } from 'actions';
import { TabPane } from 'component/ui/tabs';

const StandaloneNote = ({ isActive, isReadOnly }) => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const isTinymceFetched = useSelector(state => state.sources.fetched.includes('tinymce'));
	const isTinymceFetching = useSelector(state => state.sources.fetching.includes('tinymce'));
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);

	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			dispatch(sourceFile('tinymce'));
		}
	}, [dispatch, isTinymceFetched, isTinymceFetching]);

	const handleNoteChange = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ !isTinymceFetched }
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
