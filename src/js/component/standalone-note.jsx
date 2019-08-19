import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { TabPane } from './ui/tabs';
import RichEditorContainer from '../container/rich-editor';

const StandaloneNote = ({ isActive, item, isTinymceFetched, isTinymceFetching, sourceFile, updateItem }) => {
	useEffect(() => {
		if(!isTinymceFetched && !isTinymceFetching) {
			sourceFile('tinymce');
		}
	}, []);

	const handleNoteChange = newContent => {
		updateItem(item.key, { note: newContent });
	}

	return (
		<TabPane
			className="notes"
			isActive={ isActive }
			isLoading={ !isTinymceFetched }
		>
			<RichEditorContainer
				value={ item.note }
				onChange={ handleNoteChange }
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
