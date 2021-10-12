import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import RichEditor from '../../component/rich-editor';
import { dateLocalized } from '../../common/format';
import { get } from '../../utils';
import { getAttachmentUrl, updateItem } from '../../actions/';
import { useForceUpdate } from '../../hooks/';
import Icon from '../ui/icon';

const AttachmentDetails = ({ attachmentKey, isReadOnly }) => {
	const dispatch = useDispatch();
	const timeoutRef = useRef(null);
	const shouldUseTabs = useSelector(state => state.device.shouldUseTabs);
	const item = useSelector(
		state => get(state, ['libraries', state.current.libraryKey, 'items', attachmentKey], {}),
		shallowEqual
	);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const isFetchingUrl = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'isFetching'], false));
	const url = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'url']));
	const timestamp = useSelector(state => get(state, ['libraries', libraryKey, 'attachmentsUrl', attachmentKey, 'timestamp'], 0));
	const urlIsFresh = url && Date.now() - timestamp < 60000;
	const forceRerender = useForceUpdate();

	const handleChangeNote = useCallback((newContent, key) => {
		dispatch(updateItem(key, { note: newContent }));
	}, [dispatch]);

	useEffect(() => {
		if(urlIsFresh) {
			const urlExpiresTimestamp = timestamp + 60000;
			const urlExpriesFromNow = urlExpiresTimestamp - Date.now();
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(forceRerender, urlExpriesFromNow);
		}
		return () => clearTimeout(timeoutRef.current); // eslint-disable-line react-hooks/exhaustive-deps
	}, [forceRerender, urlIsFresh, timestamp, attachmentKey, dispatch, isFetchingUrl]);

	useEffect(() => {
		if(!urlIsFresh && !isFetchingUrl && item[Symbol.for('links')]?.enclosure) {
			dispatch(getAttachmentUrl(attachmentKey));
		}
	}, [attachmentKey, isFetchingUrl, item, urlIsFresh, dispatch]);

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
				<li className="metadata interactable">
					<div className="key">
						<label>
							{ url ? (
							<a target="_blank" rel="nofollow noopener noreferrer" href={ url }>
								Filename
								<Icon type={ '16/open-link' } className="mouse" width="12" height="12"/>
								<Icon type={ '16/open-link' } className="touch" width="16" height="16"/>
							</a>
							) : (
								<div className="truncate">Filename</div>
							) }
						</label>
					</div>
					<div className="value">
						<span className="truncate no-link">
							{ item.filename }
						</span>
					</div>
				</li>
				</React.Fragment>
			) }
			{ item.accessDate && (
				<li className="metadata">
					<div className="key">
						<label>
							<div className="truncate">
								Access Time
							</div>
						</label>
					</div>
					<div className="value">
						<div className="truncate">{ dateLocalized(new Date((item.accessDate))) }</div>
					</div>
				</li>
			) }
			{ item.dateModified && (
				<li className="metadata">
					<div className="key">
						<label>
							<div className="truncate">Modified Time</div>
						</label>
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
