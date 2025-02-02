import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { TabPane } from 'web-common/components';
import { pick } from 'web-common/utils';

import RichEditor from 'component/rich-editor';
import { get } from 'utils';
import { deleteUnusedEmbeddedImages, updateItem } from 'actions';
import { usePrepForUnmount } from '../../hooks';

const StandaloneNote = ({ id, isActive, isReadOnly, ...rest }) => {
	const dispatch = useDispatch();
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], {}));
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);

	const handleNoteChange = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	usePrepForUnmount(([lastSeenNoteKey, lastSeenIsReadOnly]) => {
		if (!lastSeenIsReadOnly) {
			dispatch(deleteUnusedEmbeddedImages(lastSeenNoteKey));
		}
	}, [itemKey, isReadOnly]);

	return (
		<TabPane
			id={ id }
			className="notes"
			isActive={ isActive }
			{...pick(rest, p => p === 'role' || p.startsWith('data-') || p.startsWith('aria-'))}
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
	id: PropTypes.string,
	isActive: PropTypes.bool,
	isReadOnly: PropTypes.bool,
}

export default StandaloneNote;
