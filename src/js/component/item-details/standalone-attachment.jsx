'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { dateLocalized } from '../../common/format';
import { TabPane } from '../ui/tabs';

const StandaloneAttachmentTabPane = ({ isActive, item, getAttachmentUrl }) => {
	const handleClick = ev => {
		ev.preventDefault();
		openAttachment(item.key);
	}

	const openAttachment = async key => {
		const url = await getAttachmentUrl(key);
		window.location = url;
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
					)}

					{item.filename && (
						<React.Fragment>
							<dt>Filename</dt>
							<dd>
								<a onClick={ handleClick }>
									{ item.filename }
								</a>
							</dd>
						</React.Fragment>
					)}
					{item.accessDate && (
						<React.Fragment>
							<dt>Access Time</dt>
							<dd>{ dateLocalized(new Date((item.accessDate))) }</dd>
						</React.Fragment>
					)}
					{item.dateModified && (
						<React.Fragment>
							<dt>Modified Time</dt>
							<dd>{ dateLocalized(new Date((item.dateModified))) }</dd>
						</React.Fragment>
					)}
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
