import PropTypes from 'prop-types';
import { memo, useCallback, useId, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DropdownItem, Icon } from 'web-common/components';

import { importFromFile, toggleModal } from '../../../actions';
import { getFileData } from '../../../common/event';
import { IDENTIFIER_PICKER } from '../../../constants/modals';


const ImportAction = ({ disabled, onFocusNext, onFocusPrev, tabIndex }) => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
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

	const handleImportClick = useCallback(ev => {
		if (ev.currentTarget === ev.target) {
			fileInputRef.current.click();
		}
		ev.stopPropagation();
	}, []);

	const handleFileInputChange = useCallback(async ev => {
		const target = ev.currentTarget; // persist, or it will be nullified after await
		const fileData = await getFileData(target.files[0]);
		target.value = ''; // clear the invisible input so that onChange is triggered even if the same file is selected again
		if (fileData) {
			dispatch(importFromFile(fileData));
			dispatch(toggleModal(IDENTIFIER_PICKER, true));
		}
	}, [dispatch]);

	return isTouchOrSmall ? (
		<DropdownItem
			onClick={handleImportClick}
			className="btn-file"
			aria-labelledby={uploadFileId}
		>
			<span
				id={uploadFileId}
				className="flex-row align-items-center"
			>
				Import From a File
			</span>
			<input
				aria-labelledby={uploadFileId}
				multiple={false}
				onChange={handleFileInputChange}
				ref={fileInputRef}
				tabIndex={-1}
				type="file"
			/>
		</DropdownItem>
	) : (
		<div className="btn-file">
			<input
				aria-labelledby={uploadFileId}
				multiple={false}
				onChange={handleFileInputChange}
				ref={fileInputRef}
				tabIndex={-1}
				type="file"
				title="Import From a File (BiBTeX, RIS, etc.)"
			/>
			<Button
				disabled={disabled}
				icon
				onClick={handleImportClick}
				onKeyDown={handleKeyDown}
				tabIndex={tabIndex}
				title="Import From a File (BiBTeX, RIS, etc.)"
			>
				<Icon type="16/import" width="16" height="16" />
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
