import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ItemsTableToolbar from './items/toolbar';
import ItemsTable from './items/table';
import ItemsList from './items/list';
import TouchHeaderWrap from '../../component/touch-header-wrap';
import TouchFooter from '../../component/touch-footer';
import { useSourceData } from '../../hooks';

const Items = ({ isSearchModeTransitioning }) => {
	const { isFetching, hasChecked } = useSourceData();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);

	return (
		<div className={
			cx('items-container', { loading: isFetching && !hasChecked })
		}>
			{ isTouchOrSmall ? (
				<React.Fragment>

						{ !isSingleColumn && <TouchHeaderWrap
							className="hidden-mouse hidden-md-down"
							variant={ TouchHeaderWrap.variants.SOURCE }
						/> }
						<ItemsList isSearchModeTransitioning={ isSearchModeTransitioning } />
						<TouchFooter />
				</React.Fragment>
			) : (
				<React.Fragment>
					<ItemsTableToolbar />
					<ItemsTable />
				</React.Fragment>
			)}
		</div>
	);
};

Items.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default memo(Items);
