import React from 'react';
import PropTypes from 'prop-types';

import { TabPane } from './ui/tabs';
import RichEditorContainer from '../container/rich-editor';

const StandaloneNote = ({ isActive, item, updateItem }) => {
	const handleNoteChange = newContent => {
		updateItem(item.key, { note: newContent });
	}

	return (
		<TabPane className="notes" isActive={ isActive }>
			<RichEditorContainer
				value={ item.note }
				onChange={ handleNoteChange }
			/>
		</TabPane>
	);
}

StandaloneNote.propTypes = {
	isActive: PropTypes.bool,
	item: PropTypes.object,
	updateItem: PropTypes.func,
}

export default StandaloneNote;
