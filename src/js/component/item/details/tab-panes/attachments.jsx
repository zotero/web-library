'use strict';

import React from 'react';
import Attachments from '../../../attachments';
import cx from 'classnames';
import Spinner from '../../../ui/spinner';
const PAGE_SIZE = 100;

class AttachmentsTabPane extends React.PureComponent {
	componentDidUpdate() {
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
		const { isActive, isReadOnly, childItems, attachmentViewUrls, onAddAttachment,
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
							isReadOnly={ isReadOnly }
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

export default AttachmentsTabPane;
