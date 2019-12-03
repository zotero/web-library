import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { TabPane } from '../ui/tabs';
import RichEditor from '../../component/rich-editor';

const StandaloneNote = ({ isActive, item, isTinymceFetched, isTinymceFetching, sourceFile, updateItem }) => {
	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			sourceFile('tinymce');
		}
	}, []);

	const handleNoteChange = useCallback(newContent => {
		updateItem(item.key, { note: newContent });
	});

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ !isTinymceFetched }
		>
			<RichEditor
				id={ item.key }
				onChange={ handleNoteChange }
				value={ item.note }
			/>
		</TabPane>
	);
}

StandaloneNote.propTypes = {
	isActive: PropTypes.bool,
	isTinymceFetched: PropTypes.bool,
	isTinymceFetching: PropTypes.bool,
	item: PropTypes.object,
	sourceFile: PropTypes.func,
	updateItem: PropTypes.func,
}

export default StandaloneNote;
