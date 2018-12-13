'use strict';

const React = require('react');
const cx = require('classnames');
const Notes = require('../../../notes');
const Spinner = require('../../../ui/spinner');

class NotesTabPane extends React.PureComponent {
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
		const { isLoadingChildItems, isActive, item, childItems, onNoteChange,
			onAddNote, onDeleteNote } = this.props;
		const { numChildren = 0 } = item[Symbol.for('meta')];
		return (
			<div className={ cx({
				'tab-pane': true,
				'notes': true,
				'active': isActive,
				'loading': numChildren > childItems.length
			}) }>
				{
					numChildren > childItems.length ? <Spinner /> : (
						<React.Fragment>
							<h5 className="h2 tab-pane-heading">Notes</h5>
							<Notes
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

module.exports = NotesTabPane;
