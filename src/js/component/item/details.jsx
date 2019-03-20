'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const Types = require('../../types');

const ItemDetailsTabs = require('./details/tabs');
const ItemDetailsInfoView = require('./details/info-view');
const ItemDetailsInfoSelected = require('./details/info-selected');
const TouchHeaderContainer = require('../../container/touch-header');

class ItemDetails extends React.PureComponent {
	render() {
		const { device, isSelectMode, item, selectedItemKeys, active, } = this.props;
		return (
			<section className={ cx('item-details', { 'active': active }) }>
				<TouchHeaderContainer
					className="hidden-mouse hidden-md-down darker"
					variant={ TouchHeaderContainer.variants.ITEM }
				/>
				{
					(!device.isTouchOrSmall || (device.isTouchOrSmall && !isSelectMode))
					&& item && 'key' in item ? (
						<ItemDetailsTabs { ...this.props } />
					) : (
						!device.isTouchOrSmall && selectedItemKeys.length ? (
							<ItemDetailsInfoSelected { ...this.props } />
						) : (
							<ItemDetailsInfoView { ...this.props } />
						)
					)
				}
			</section>
		);
	}
}

ItemDetails.defaultProps = {
	item: {},
	active: false,
	selectedItemKeys: []
};

ItemDetails.propTypes = {
	active: PropTypes.bool,
	device: PropTypes.object,
	isSelectMode: PropTypes.bool,
	item: Types.item,
	selectedItemKeys: PropTypes.array,
};

module.exports = ItemDetails;
