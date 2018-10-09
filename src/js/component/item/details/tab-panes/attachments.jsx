'use strict';

const React = require('react');
const Attachments = require('../../../attachments');
const cx = require('classnames');
const Spinner = require('../../../ui/spinner');

class AttachmentsTabPane extends React.PureComponent {
	render() {
		const { isActive, childItems, attachmentViewUrls, onAddAttachment,
			onDeleteAttachment, isLoadingChildItems } = this.props;
		return (
			<div className={ cx({
				'tab-pane': true,
				'attachments': true,
				'active': isActive,
				'loading': isLoadingChildItems,
			}) }>
				{
				isLoadingChildItems ? <Spinner /> : (
					<React.Fragment>
						<h5 className="h2 tab-pane-heading">Attachments</h5>
						<Attachments
							attachments={ childItems.filter(i => i.itemType === 'attachment') }
							attachmentViewUrls={ attachmentViewUrls }
							onAddAttachment={ onAddAttachment }
							onDeleteAttachment={ onDeleteAttachment }
						/>
					</React.Fragment>
					)
				}
			</div>
		);
	}

	static defaultProps = {
		childItems: []
	}
}

module.exports = AttachmentsTabPane;
