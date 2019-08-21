'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Types from '../../types';
import ItemDetailsTabs from '../item-details/tabs';
import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsInfoSelected from '../item-details/info-selected';
import TouchHeaderContainer from '../../container/touch-header';

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

export default ItemDetails;
