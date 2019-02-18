'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { pluralize } = require('../../../common/format');

class ItemDetailsInfoView extends React.PureComponent {
	shouldComponentUpdate({ itemsCount: nextItemsCount }) {
		const { itemsCount } = this.props;
		return itemsCount !== nextItemsCount;
	}

	render() {
		const { itemsCount } = this.props;
		const label = typeof(itemsCount) === 'number' ? [
			itemsCount === 0 ? 'No' : itemsCount,
			pluralize('Item', itemsCount),
			'in this view'
		].join(' ') : '';

		return (
			<div className="info-view">{ label }</div>
		);
	}

	static propTypes = {
		itemsCount: PropTypes.number
	}

	static defaultProps = {
		itemsCount: null
	}
}

module.exports = ItemDetailsInfoView;
