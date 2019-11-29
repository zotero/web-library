import React, { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';

import { getAttachmentUrl } from '../../actions/';
import { dateLocalized } from '../../common/format';
import { get, openAttachment } from '../../utils';


const AttachmentDetails = ({ attachmentKey }) => {
	const dispatch = useDispatch();
	const dispatchGetAttachmentUrl = useCallback((...args) => dispatch(getAttachmentUrl(...args)));
	const item = useSelector(
		state => get(state, ['libraries', state.current.libraryKey, 'items', attachmentKey], {}),
		shallowEqual
	);

	const handleLinkInteraction = useCallback(ev => {
		ev.preventDefault();
		openAttachment(item.key, dispatchGetAttachmentUrl, true);
	});

	return (
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
				<li className="metadata">
					<div className="key">
						<div className="truncate">Filename</div>
					</div>
					<div className="value">
						{ item[Symbol.for('links')].enclosure ? (
							<a
								className="truncate"
								onMouseDown={ handleLinkInteraction }
								onClick={ handleLinkInteraction }
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
	);
}

AttachmentDetails.propTypes = {
	attachmentKey: PropTypes.string.isRequired,
}

export default AttachmentDetails;
