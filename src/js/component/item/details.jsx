'use strict';

import React, { useEffect } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import ItemDetailsInfoSelected from '../item-details/info-selected';
import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderContainer from '../../container/touch-header';
import Types from '../../types';
import withDevice from '../../enhancers/with-device';

const PAGE_SIZE = 100;

const ItemDetails = props => {
	const { active, device, fetchChildItems, fetchItemsByKeys, isFetching, isFetched, isSelectMode,
	item, itemKey, itemKeys, itemsCount, pointer } = props;


	useEffect(() => {
		if(itemKey && !item) {
			fetchItemsByKeys([itemKey]);
		}
	}, [itemKey]);

	useEffect(() => {
		if(device.shouldUseTabs) {
			// don't do the fetch, child items are fetched when user opens notes or attachments tab
			return;
		}
		if(itemKey && !isFetching && !isFetched) {
			const start = pointer || 0;
			const limit = PAGE_SIZE;
			fetchChildItems(itemKey, { start, limit });
		}
	}, [device, isFetching, isFetched, itemKey, pointer]);

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
					!device.isTouchOrSmall && itemKeys.length > 1 ? (
						<ItemDetailsInfoSelected itemKeys={ itemKeys } />
					) : !itemKey && (
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
	fetchItemsByKeys: PropTypes.func,
	isSelectMode: PropTypes.bool,
	item: Types.item,
	itemKey: PropTypes.string,
	itemKeys: PropTypes.array,
	itemsCount: PropTypes.number,
};

export default withDevice(ItemDetails);
