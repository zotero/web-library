'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const { itemProp } = require('../../constants/item');

const ItemDetailsTabs = require('./details/tabs');
const ItemDetailsInfoView = require('./details/info-view');
const ItemDetailsInfoSelected = require('./details/info-selected');
const TouchHeaderContainer = require('../../container/touch-header');

class ItemDetails extends React.Component {
	render() {
		const { item, selectedItemKeys, active } = this.props;

		return (
			<section className={ cx('item-details', { 'active': active }) }>
				<TouchHeaderContainer
					className="hidden-mouse hidden-md-down"
					includeNav={ false }
				/>
				{
					'key' in item ? (
						<ItemDetailsTabs { ...this.props } />
					) : (
						selectedItemKeys.length ? (
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
	item: itemProp,
	selectedItemKeys: PropTypes.array
};

module.exports = ItemDetails;
