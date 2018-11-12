'use strict';

const React = require('react');
const PropTypes = require('prop-types');

class ItemDetailsInfoView extends React.PureComponent {
	shouldComponentUpdate({ itemsCount: nextItemsCount }) {
		const { itemsCount } = this.props;
		return itemsCount !== nextItemsCount;
	}

	render() {
		const { itemsCount } = this.props;
		var label;
		switch(itemsCount) {
			case null:
				label = '';
			break;
			case 0:
				label = 'No items in this view';
			break;
			case 1:
				label = '1 item in this view';
			break;
			default:
				label = `${itemsCount} items in this view`;
			break;
		}
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
