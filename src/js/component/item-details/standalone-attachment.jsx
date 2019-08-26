'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { dateLocalized } from '../../common/format';
import { TabPane } from '../ui/tabs';
import { openAttachment } from '../../utils';

const StandaloneAttachmentTabPane = ({ isActive, item, getAttachmentUrl }) => {
	const handleLinkInteraction = ev => {
		if(ev.type === 'mousedown' && ev.button === 1) {
			ev.preventDefault();
			openAttachment(item.key, getAttachmentUrl, true);
		} else if(ev.type === 'click') {
			ev.preventDefault();
			openAttachment(item.key, getAttachmentUrl, ev.getModifierState('Meta'));
		}
	}

	return (
		<TabPane className="standalone-attachment" isActive={ isActive } >
			<div className="standalone-attachment">
				<dl>
					{ item.url && (
						<React.Fragment>
							<dt>Original URL</dt>
							<dd>
								<a href={ item.url }>
									{ item.url }
								</a>
							</dd>
						</React.Fragment>
					) }
					{ item.filename && item.linkMode.startsWith('imported') && (
						<React.Fragment>
							<dt>Filename</dt>
							<dd>
								<a onMouseDown={ handleLinkInteraction } onClick={ handleLinkInteraction }>
									{ item.filename }
								</a>
							</dd>
						</React.Fragment>
					) }
					{ item.accessDate && (
						<React.Fragment>
							<dt>Access Time</dt>
							<dd>{ dateLocalized(new Date((item.accessDate))) }</dd>
						</React.Fragment>
					) }
					{ item.dateModified && (
						<React.Fragment>
							<dt>Modified Time</dt>
							<dd>{ dateLocalized(new Date((item.dateModified))) }</dd>
						</React.Fragment>
					) }
				</dl>
			</div>
		</TabPane>
	);
}

StandaloneAttachmentTabPane.propTypes = {
	getAttachmentUrl: PropTypes.func,
	isActive: PropTypes.bool,
	item: PropTypes.object,
}

export default StandaloneAttachmentTabPane;
