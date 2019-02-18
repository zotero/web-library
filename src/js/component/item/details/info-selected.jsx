'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { pluralize } = require('../../../common/format');

class ItemDetailsInfoSelected extends React.PureComponent {
	render() {
		const { selectedItemKeys: { length: count } } = this.props;
		const label = [
			count === 0 ? 'No' : count,
			pluralize('Item', count),
			'Selected'
		].join(' ');
		return (
			<div className="info-view">
				{ label }
			</div>
		);
	}

	static propTypes = {
		selectedItemKeys: PropTypes.array.isRequired
	}
}

module.exports = ItemDetailsInfoSelected;
