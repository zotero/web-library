'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { dateLocalized } from '../../common/format';
import { TabPane } from '../ui/tabs';
import { openAttachment } from '../../utils';

const StandaloneAttachmentTabPane = ({ isActive, item, getAttachmentUrl }) => {
	const handleLinkInteraction = ev => {
		ev.preventDefault();
		openAttachment(item.key, getAttachmentUrl, true);
	}

	return (
		<TabPane className="standalone-attachment" isActive={ isActive } >
			<ol className="metadata-list">
				{ item.url && (
					<li className="metadata">
						<div className="key">
							<div className="truncate">Original URL</div>
						</div>
						<div className="value">
							<a
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
		</TabPane>
	);
}

StandaloneAttachmentTabPane.propTypes = {
	getAttachmentUrl: PropTypes.func,
	isActive: PropTypes.bool,
	item: PropTypes.object,
}

export default StandaloneAttachmentTabPane;
