import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import Icon from 'component/ui/icon';
import RichEditor from 'component/rich-editor';
import { dateLocalized } from 'common/format';
import { get } from 'utils';
import { getAttachmentUrl, updateItem } from 'actions';
import { useForceUpdate } from 'hooks';
import { makePath } from '../../common/navigation';

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
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const qmode = useSelector(state => state.current.qmode);
	const search = useSelector(state => state.current.search);
	const tags = useSelector(state => state.current.tags);
	const config = useSelector(state => state.config);
	const isStandaloneAttachment = attachmentKey === itemKey;
	const openInReaderPath = makePath(config, {
		library: libraryKey,
		collection: collectionKey,
		items: isStandaloneAttachment ? [attachmentKey] : [itemKey],
		attachmentKey: isStandaloneAttachment ? null : attachmentKey,
		view: 'reader',
		qmode: qmode,
		search: search,
		tags: tags,
	});

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
						<label>
							<a target="_blank" rel="nofollow noopener noreferrer" href={ item.url }>
								<span className="truncate">Original URL</span>
								<Icon type={ '16/open-link' } className="mouse" width="12" height="12"/>
								<Icon type={ '16/open-link' } className="touch" width="16" height="16"/>
							</a>
						</label>
					</div>
					<div className="value">
						<span className="truncate" title={ item.url }>
							{ item.url }
						</span>
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
								<span className="truncate">Filename</span>
								<Icon type={ '16/open-link' } className="mouse" width="12" height="12"/>
								<Icon type={ '16/open-link' } className="touch" width="16" height="16"/>
							</a>
							) : (
								<span className="truncate">Filename</span>
							) }
						</label>
					</div>
					<div className="value">
						<span className="truncate no-link" title={ item.filename }>
							{ item.contentType === 'application/pdf' ? (
								<a target="_blank" rel="nofollow noopener noreferrer" href={ openInReaderPath }>
									{ item.filename }
									<Icon type={'16/reader'} className="mouse" width="12" height="12" />
									<Icon type={'16/reader'} className="touch" width="16" height="16" />
								</a>
							) : (
								<span className="truncate">{ item.filename }</span>
							) }
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
