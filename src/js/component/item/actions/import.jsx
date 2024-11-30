import PropTypes from 'prop-types';
import { memo, useCallback, useId, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { importFromFile } from '../../../actions';
import { getFileData } from '../../../common/event';


const ImportAction = ({ disabled, onFocusNext, onFocusPrev, tabIndex }) => {
	const dispatch = useDispatch();
	const uploadFileId = useId();
	const fileInputRef = useRef(null);

	const handleKeyDown = useCallback(ev => {
		if (ev.target !== ev.currentTarget) {
			return;
		}

		if (ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [onFocusNext, onFocusPrev]);

	const handleImportClick = useCallback(() => {
		fileInputRef.current.click();
	}, []);

	const handleFileInputChange = useCallback(async ev => {
		const fileData = await getFileData(ev.currentTarget.files[0]);
		if (fileData) {
			dispatch(importFromFile(fileData));
		}
	}, [dispatch]);

	return (
		<div className="btn-file">
			<input
				aria-labelledby={uploadFileId}
				multiple={false}
				onChange={handleFileInputChange}
				ref={fileInputRef}
				tabIndex={-1}
				type="file"
			/>
			<Button
				disabled={disabled}
				icon
				onClick={handleImportClick}
				onKeyDown={handleKeyDown}
				tabIndex={tabIndex}
				title="Import"
			>
				<Icon type="16/caret-16" width="16" height="16" />
			</Button>

		</div>
	);
}

ImportAction.propTypes = {
	disabled: PropTypes.bool,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	tabIndex: PropTypes.number
};

export default memo(ImportAction);
