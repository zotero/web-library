import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import RichEditor from '../../component/rich-editor';
import { dateLocalized } from '../../common/format';
import { get } from '../../utils';
import { getAttachmentUrl, updateItem } from '../../actions/';

const refreshAttachmentUrl = async (attachmentKey, setAttachmentUrl, dispatch, timeoutRef) => {
	const url = await dispatch(getAttachmentUrl(attachmentKey));
	setAttachmentUrl(url);
	timeoutRef.current = setTimeout(refreshAttachmentUrl, 60000, attachmentKey, setAttachmentUrl, dispatch, timeoutRef);
}

const AttachmentDetails = ({ attachmentKey, isReadOnly }) => {
	const dispatch = useDispatch();
	const timeoutRef = useRef(null);
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const item = useSelector(
		state => get(state, ['libraries', state.current.libraryKey, 'items', attachmentKey], {}),
		shallowEqual
	);
	const [attachmentUrl, setAttachmentUrl] = useState(null);

	const handleChangeNote = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	useEffect(() => {
		if(item[Symbol.for('links')].enclosure) {
			refreshAttachmentUrl(attachmentKey, setAttachmentUrl, dispatch, timeoutRef);
			return () => clearTimeout(timeoutRef.current); // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [attachmentKey]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<React.Fragment>
		<ol className="metadata-list">
			{ item.url && (
				<li className="metadata">
					<div className="key">
						<div className="truncate">Original URL</div>
					</div>
					<div className="value">
						<a
							target="_blank" rel="nofollow noopener noreferrer"
							href={ item.url }
							className="truncate"
						>
							{ item.url }
						</a>
					</div>
				</li>
			) }
			{ item.filename && item.linkMode.startsWith('imported') && (
				<React.Fragment>
				<li className="metadata">
					<div className="key">
						<div className="truncate">Filename</div>
					</div>
					<div className="value">
						{ attachmentUrl ? (
							<a
								href={ attachmentUrl }
								className="truncate"
							>
								{ item.filename }
							</a>
						) : (
							<span className="truncate no-link">
								{ item.filename }
							</span>
						) }
					</div>
				</li>
				</React.Fragment>
			) }
			{ item.accessDate && (
				<li className="metadata">
					<div className="key">
						<div className="truncate">
							Access Time
						</div>
					</div>
					<div className="value">
						<div className="truncate">{ dateLocalized(new Date((item.accessDate))) }</div>
					</div>
				</li>
			) }
			{ item.dateModified && (
				<li className="metadata">
					<div className="key">
						<div className="truncate">Modified Time</div>
					</div>
					<div className="value">
						<div className="truncate">{ dateLocalized(new Date((item.dateModified))) }</div>
					</div>
				</li>
			) }
		</ol>
		<RichEditor
			autoresize={ shouldUseTabs ? false : true }
			id={ item.key }
			isReadOnly={ isReadOnly }
			value={ item.note }
			onChange={ handleChangeNote }
		/>
		</React.Fragment>
	);
}

AttachmentDetails.propTypes = {
	attachmentKey: PropTypes.string.isRequired,
	isReadOnly: PropTypes.bool,
}

export default React.memo(AttachmentDetails);
