'use strict';

const React = require('react');
const Attachments = require('../../../attachments');
const cx = require('classnames');
const Spinner = require('../../../ui/spinner');
const PAGE_SIZE = 100;

class AttachmentsTabPane extends React.PureComponent {
	componentDidUpdate({ prevItem, wasActive }) {
		const { item, isActive, fetchChildItems, childItems,
			isLoadingChildItems, totalChildItems } = this.props;

		const hasMoreItems = totalChildItems > childItems.length ||
			typeof(totalChildItems) === 'undefined';

		const start = childItems.length;
		const limit = PAGE_SIZE;

		if(!isLoadingChildItems && isActive && hasMoreItems) {
			fetchChildItems(item.key, { start, limit });
		}
	}

	render() {
		const { isActive, item, childItems, attachmentViewUrls, onAddAttachment,
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
