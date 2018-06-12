'use strict';

const React = require('react');
const Attachments = require('../../../attachments');const cx = require('classnames');

class AttachmentsTabPane extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'attachments': true,
				'active': this.props.isActive
			}) }>
				<h5 className="h2 tab-pane-heading">Attachments</h5>
				<Attachments
					attachments={ this.props.childItems.filter(i => i.itemType === 'attachment') }
					attachentViewUrls={ this.props.attachentViewUrls }
					onAddAttachment={ this.props.onAddAttachment }
					onDeleteAttachment={ this.props.onDeleteAttachment }
				/>
			</div>
		);
	}
}

module.exports = AttachmentsTabPane;
