'use strict';

import React from 'react';
import cx from 'classnames';
import Notes from '../../../notes';
import Spinner from '../../../ui/spinner';
const PAGE_SIZE = 100;

class NotesTabPane extends React.PureComponent {
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
		const { isLoadingChildItems, isReadOnly, isActive, item, childItems,
			 onNoteChange, onAddNote, onDeleteNote } = this.props;
		return (
			<div className={ cx({
				'tab-pane': true,
				'notes': true,
				'active': isActive,
				'loading': isLoadingChildItems
			}) }>
				{
					isLoadingChildItems ? <Spinner /> : (
						<React.Fragment>
							<h5 className="h2 tab-pane-heading hidden-mouse">Notes</h5>
							<Notes
								isReadOnly={ isReadOnly }
								item={ item }
								notes={ childItems.filter(i => i.itemType === 'note') }
								onChange={ onNoteChange }
								onAddNote={ onAddNote }
								onDeleteNote={ onDeleteNote }
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

export default NotesTabPane;
