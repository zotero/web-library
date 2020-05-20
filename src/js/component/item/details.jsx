import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderContainer from '../../container/touch-header';
import withDevice from '../../enhancers/with-device';
import { navigate, fetchItemsByKeys } from '../../actions';
import { get } from '../../utils';

const ItemDetails = props => {
	const { active, device } = props;
	const dispatch = useDispatch();
	const itemKey = useSelector(state => state.current.itemKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], null));
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const shouldRedirectToParentItem = itemKey && item && item.parentItem;

	useEffect(() => {
		if(itemKey && !item) {
			dispatch(fetchItemsByKeys([itemKey]));
		}
	}, [item, itemKey]);

	useEffect(() => {
		if(shouldRedirectToParentItem) {
			dispatch(navigate({
				items: [item.parentItem],
				[item.itemType === 'note' ? 'noteKey' : 'attachmentKey']: item.key,
			}));
		}
	}, [shouldRedirectToParentItem]);

	return (
		<section className={ cx('item-details', { 'active': active }) }>
			<TouchHeaderContainer
				className="hidden-mouse hidden-md-down darker"
				variant={ TouchHeaderContainer.variants.ITEM }
			/>
			{
				(!device.isTouchOrSmall || (device.isTouchOrSmall && !isSelectMode))
				&& item && !shouldRedirectToParentItem ? (
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
