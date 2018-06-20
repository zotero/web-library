'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class ItemDetailsInfoView extends React.PureComponent {
	render() {
		return (
			<div className="info-view">
				{
					this.props.itemsCount !== null &&
					`${this.props.itemsCount} items in this view`
				}
			</div>
		);
	}
}

module.exports = ItemDetailsInfoView;
