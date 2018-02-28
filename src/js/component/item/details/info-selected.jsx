'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class ItemDetailsInfoSelected extends React.PureComponent {
	render() {
		return (
			<div className="info-wrapper">
				<div className="info">
					{
						this.props.selectedItemKeys.length > 0 &&
						`${this.props.selectedItemKeys.length} items selected`
					}
				</div>
			</div>
		);
	}
}

module.exports = ItemDetailsInfoSelected;