import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderContainer from '../../container/touch-header';
import withDevice from '../../enhancers/with-device';
import { fetchItemsByKeys } from '../../actions';
import { get } from '../../utils';

const ItemDetails = props => {
	const { active, device } = props;
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], null));
	const isSelectMode = useSelector(state => state.current.isSelectMode);

	useEffect(() => {
		if(itemKey && !item) {
			dispatch(fetchItemsByKeys([itemKey]));
		}
	}, [item, itemKey]);

	return (
		<section className={ cx('item-details', { 'active': active }) }>
			<TouchHeaderContainer
				className="hidden-mouse hidden-md-down darker"
				variant={ TouchHeaderContainer.variants.ITEM }
			/>
			{
				(!device.isTouchOrSmall || (device.isTouchOrSmall && !isSelectMode))
				&& item ? (
					<ItemDetailsTabs />
				) : (
					<ItemDetailsInfoView />
				)
			}
		</section>
	);
}

ItemDetails.defaultProps = {
	active: false,
};

ItemDetails.propTypes = {
	active: PropTypes.bool,
	device: PropTypes.object,
};

export default withDevice(ItemDetails);
