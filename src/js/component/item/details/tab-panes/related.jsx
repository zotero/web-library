'use strict';

const React = require('react');
const cx = require('classnames');
const Relations = require('../../../relations');
const Spinner = require('../../../ui/spinner');

class RelatedTabPane extends React.PureComponent {
	componentDidUpdate({ prevItem, wasActive }) {
		const { item, isActive, fetchItems, relatedItemsKeys, relatedItems, isLoadingRelatedItems } = this.props;

		if(!isLoadingRelatedItems && isActive && relatedItemsKeys.length > relatedItems.length) {
			if(item && !prevItem || prevItem && item.key !== prevItem.key || !wasActive) {
				fetchItems(relatedItemsKeys);
			}
		}
	}

	render() {
		const { isActive, relatedItems, relatedItemsKeys, collection,
			onRelatedItemSelect, onRelatedItemDelete } = this.props;
		const isLoading = relatedItemsKeys.length > relatedItems.length;
		return (
			<div className={ cx({
				'tab-pane': true,
				'related': true,
				'active': isActive,
				'loading': isLoading,
			}) }>
			{
				isLoading ? <Spinner /> : (
					<React.Fragment>
						<h5 className="h2 tab-pane-heading">Related</h5>
						<Relations
							relations={ relatedItems }
							collection={ collection }
							onRelatedItemSelect={ onRelatedItemSelect }
							onRelatedItemDelete={ onRelatedItemDelete }
						/>
						</React.Fragment>
					)
				}
		</div>
		);
	}
}

module.exports = RelatedTabPane;
