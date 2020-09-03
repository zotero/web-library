import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ItemDetailsInfoView from '../item-details/info-view';
import ItemDetailsTabs from '../item-details/tabs';
import TouchHeaderContainer from '../../container/touch-header';
import { navigate, fetchItemDetails } from '../../actions';
import { get } from '../../utils';

const ItemDetails = props => {
	const { active } = props;
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.current.isTouchOrSmall);
	const itemKey = useSelector(state => state.current.itemKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const item = useSelector(state => get(state, ['libraries', libraryKey, 'items', itemKey], null));
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const shouldRedirectToParentItem = itemsSource !== 'trash' && itemKey && item && item.parentItem;

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
			{ isTouchOrSmall && (
				<TouchHeaderContainer
					className="hidden-mouse hidden-md-down darker"
					variant={ TouchHeaderContainer.variants.ITEM }
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
