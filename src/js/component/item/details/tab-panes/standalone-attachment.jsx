'use strict';

const React = require('react');
const cx = require('classnames');

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
					<div className="download-link">
						{
							item[Symbol.for('attachmentUrl')] &&
							<a href={ item[Symbol.for('attachmentUrl')] }>
								{ item.filename }
							</a>
						}
					</div>
					<div className="download-link">
						{
							item.url &&
							<a href={ item.url }>
								{ item.url }
							</a>
						}
					</div>
				</div>
			</div>
		);
	}
}

module.exports = StandaloneAttachmentTabPane;
