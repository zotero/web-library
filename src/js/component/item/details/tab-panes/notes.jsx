'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Notes from '../../../notes';
import Spinner from '../../../ui/spinner';
import { pick } from '../../../../common/immutable';
const PAGE_SIZE = 100;

class NotesTabPane extends React.PureComponent {
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
		const { isLoadingChildItems, item, isActive, childItems } = this.props;
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
								key={ item.key }
								notes={ childItems.filter(i => i.itemType === 'note') }
								{ ...pick(this.props, ['device', 'item', 'isReadOnly',
									'noteKey', 'navigate', 'updateItem', 'onAddNote',
									'onDeleteNote'] ) }
							/>
						</React.Fragment>
					)
				}
			</div>
		);
	}

	static propTypes = {
		childItems: PropTypes.array,
		fetchChildItems: PropTypes.func,
		isActive: PropTypes.bool,
		isLoadingChildItems: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		item: PropTypes.object,
		totalChildItems: PropTypes.number,
	}

	static defaultProps = {
		childItems: []
	}
}

export default NotesTabPane;
