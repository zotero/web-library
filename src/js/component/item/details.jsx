'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import ItemDetailsInfoSelected from '../item-details/info-selected';
import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderContainer from '../../container/touch-header';
import withDevice from '../../enhancers/with-device';
import Types from '../../types';

const ItemDetails = props => {
	const { device, isSelectMode, item, itemKeys, itemsCount, active } = props;

	return (
		<section className={ cx('item-details', { 'active': active }) }>
			<TouchHeaderContainer
				className="hidden-mouse hidden-md-down darker"
				variant={ TouchHeaderContainer.variants.ITEM }
			/>
			{
				(!device.isTouchOrSmall || (device.isTouchOrSmall && !isSelectMode))
				&& item ? (
					<ItemDetailsTabs { ...props } />
				) : (
					!device.isTouchOrSmall && itemKeys.length ? (
						<ItemDetailsInfoSelected itemKeys={ itemKeys } />
					) : (
						<ItemDetailsInfoView itemsCount={ itemsCount } />
					)
				)
			}
		</section>
	);
}

ItemDetails.defaultProps = {
	item: {},
	active: false,
	itemKeys: []
};

ItemDetails.propTypes = {
	active: PropTypes.bool,
	device: PropTypes.object,
	isSelectMode: PropTypes.bool,
	item: Types.item,
	itemKeys: PropTypes.array,
	itemsCount: PropTypes.number,
};

export default withDevice(ItemDetails);
