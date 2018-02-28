'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class ItemDetailsInfoView extends React.PureComponent {
	render() {
		return (
			<div className="info-wrapper">
				<div className="info">
					{
						this.props.itemsCount !== null &&
						`${this.props.itemsCount} items in this view`
					}
				</div>
			</div>
		);
	}
}

module.exports = ItemDetailsInfoView;