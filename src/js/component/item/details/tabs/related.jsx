'use strict';

const React = require('react');
const cx = require('classnames');
const Relations = require('../../../relations');

class RelatedTab extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'related': true,
				'active': this.props.isActive
			}) }>
			<h5 className="h2 tab-pane-heading">Related</h5>
			<Relations
				relations={ this.props.relations }
				collection={ this.props.collection }
				onRelatedItemSelect={ this.props.onRelatedItemSelect }
				onRelatedItemDelete={ this.props.onRelatedItemDelete }
			/>
		</div>
		);
	}
}

module.exports = RelatedTab;
