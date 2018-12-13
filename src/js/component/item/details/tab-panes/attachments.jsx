'use strict';

const React = require('react');
const Attachments = require('../../../attachments');
const cx = require('classnames');
const Spinner = require('../../../ui/spinner');

class AttachmentsTabPane extends React.PureComponent {
	componentDidUpdate({ prevItem, wasActive }) {
		const { item, isActive, fetchChildItems, childItems, isLoadingChildItems } = this.props;
		const { numChildren = 0 } = item[Symbol.for('meta')];

		if(!isLoadingChildItems && isActive && numChildren > childItems.length) {
			if(item && !prevItem || prevItem && item.key !== prevItem.key || !wasActive) {
				fetchChildItems(item.key);
			}
		}
	}

	render() {
		const { isActive, item, childItems, attachmentViewUrls, onAddAttachment,
			onDeleteAttachment, isLoadingChildItems } = this.props;
		const { numChildren = 0 } = item[Symbol.for('meta')];
		return (
			<div className={ cx({
				'tab-pane': true,
				'attachments': true,
				'active': isActive,
				'loading': numChildren > childItems.length,
			}) }>
				{
				numChildren > childItems.length ? <Spinner /> : (
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
