'use strict';

import React from 'react';
import cx from 'classnames';

import { dateLocalized } from '../../../../common/format';

class StandaloneAttachmentTabPane extends React.PureComponent {
	render() {
		const { item, isActive } = this.props;
		return (
			<div className={ cx({
				'tab-pane': true,
				'standalone-attachment': true,
				'active': isActive
			}) }>
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
									{ item[Symbol.for('attachmentUrl')] ? (
										<a href={ item[Symbol.for('attachmentUrl')] }>
											{ item.filename }
										</a>
									) : item.filename }
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
			</div>
		);
	}
}

export default StandaloneAttachmentTabPane;
