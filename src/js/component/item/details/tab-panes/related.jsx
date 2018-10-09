'use strict';

const React = require('react');
const cx = require('classnames');
const Relations = require('../../../relations');
const Spinner = require('../../../ui/spinner');

class RelatedTabPane extends React.PureComponent {
	render() {
		const { isLoadingRelated, isActive, relatedItems, collection, onRelatedItemSelect,
			onRelatedItemDelete } = this.props;
		return (
			<div className={ cx({
				'tab-pane': true,
				'related': true,
				'active': isActive,
				'loading': isLoadingRelated,
			}) }>
			{
				isLoadingRelated ? <Spinner /> : (
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
