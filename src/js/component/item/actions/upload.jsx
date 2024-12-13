import { memo, useCallback, useId, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DropdownItem } from 'web-common/components';

import { createAttachments } from '../../../actions';
import { getFilesData } from '../../../common/event';


const UploadAction = () => {
	const dispatch = useDispatch();
	const uploadFileId = useId();
	const fileInputRef = useRef(null);
	const collectionKey = useSelector(state => state.current.collectionKey);

	const handleUploadClick = useCallback(ev => {
		if (ev.currentTarget === ev.target) {
			fileInputRef.current.click();
		}
		ev.stopPropagation();
	}, []);

	const handleFileInputChange = useCallback(async ev => {
		const target = ev.currentTarget; // persist, or it will be nullified after await
		const filesData = await getFilesData(Array.from(ev.currentTarget.files));
		target.value = ''; // clear the invisible input so that onChange is triggered even if the same file is selected again
		dispatch(createAttachments(filesData, { collection: collectionKey }));
	}, [collectionKey, dispatch]);

	return (
		<DropdownItem
			onClick={handleUploadClick}
			className="btn-file"
			aria-labelledby={uploadFileId}
		>
			<span
				id={uploadFileId}
				className="flex-row align-items-center"
			>
				Upload File
			</span>
			<input
				aria-labelledby={uploadFileId}
				data-no-toggle
				multiple={true}
				onChange={handleFileInputChange}
				ref={fileInputRef}
				tabIndex={-1}
				type="file"
			/>
		</DropdownItem>
	);
}

export default memo(UploadAction);
