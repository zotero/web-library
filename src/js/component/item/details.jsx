import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderWrap from '../../component/touch-header-wrap';
import { navigate, fetchItemDetails } from '../../actions';
import { get } from '../../utils';

const ItemDetails = props => {
	const { active } = props;
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const itemKey = useSelector(state => state.current.itemKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], null));
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const isTrash = useSelector(state => state.current.isTrash);
	const shouldRedirectToParentItem = !isTrash && itemKey && item && item.parentItem;

	useEffect(() => {
		if(itemKey && !item) {
			dispatch(fetchItemDetails(itemKey));
		}
	}, [dispatch, item, itemKey]);

	useEffect(() => {
		if(shouldRedirectToParentItem) {
			dispatch(navigate({
				items: [item.parentItem],
				[item.itemType === 'note' ? 'noteKey' : 'attachmentKey']: item.key,
			}));
		}
	}, [dispatch, shouldRedirectToParentItem, item]);

	return (
		<section className={ cx('item-details', { 'active': active }) }>
			{ isTouchUser && (
				<TouchHeaderWrap
					className="hidden-mouse hidden-md-down darker"
					variant={ TouchHeaderWrap.variants.ITEM }
				/>
			) }
			{
				(!isTouchOrSmall || (isTouchOrSmall && !isSelectMode))
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

export default memo(ItemDetails);
