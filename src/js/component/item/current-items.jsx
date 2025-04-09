import { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ItemsTableToolbar from 'component/item/items/toolbar';
import ItemsTable from './items/table';
import ItemsList from './items/list';
import TouchHeaderWrap from '../../component/touch-header-wrap';
import TouchFooter from '../../component/touch-footer';
import { useSourceData, useSourceSignature } from '../../hooks';

const CurrentItems = props => {
	const { isSearchModeTransitioning } = props;
	const { isFetching, hasChecked } = useSourceData();
	const sourceSignature = useSourceSignature();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isLarge = useSelector(state => state.device.lg);
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const selectedItemKeys = useSelector(state => state.current.itemKeys);
	const isAdvancedSearch = useSelector(state => state.current.isAdvancedSearch);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const view = useSelector(state => state.current.view);
	const sharedProps = { libraryKey, collectionKey, itemsSource, selectedItemKeys, isAdvancedSearch, isSearchMode, isSelectMode, view };

	return (
		<div className={
			cx('items-container', { loading: isFetching && !hasChecked })
		}>
			{isTouchOrSmall ? (
				<Fragment>
					{(isLarge && !isEmbedded) && <TouchHeaderWrap
						className="hidden-mouse hidden-md-down"
						variant={TouchHeaderWrap.variants.SOURCE}
					/>}
					<ItemsList
						key={ sourceSignature }
						isSearchModeTransitioning={isSearchModeTransitioning}
						{...sharedProps }
					/>
					<TouchFooter />
				</Fragment>
			) : (
				<Fragment>
					{!isEmbedded && <ItemsTableToolbar />}
						<ItemsTable key={ sourceSignature } { ...sharedProps } />
				</Fragment>
			)}
		</div>
	);
};

CurrentItems.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default memo(CurrentItems);
