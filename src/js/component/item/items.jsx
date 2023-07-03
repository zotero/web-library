import { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ItemsTableToolbar from 'component/item/items/toolbar';
import ItemsTable from './items/table';
import ItemsList from './items/list';
import TouchHeaderWrap from '../../component/touch-header-wrap';
import TouchFooter from '../../component/touch-footer';
import { useSourceData } from '../../hooks';

const Items = ({ isSearchModeTransitioning }) => {
	const { isFetching, hasChecked } = useSourceData();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isLarge = useSelector(state => state.device.lg);
	const isEmbedded = useSelector(state => state.config.isEmbedded);

	return (
        <div className={
			cx('items-container', { loading: isFetching && !hasChecked })
		}>
			{ isTouchOrSmall ? (
				<Fragment>
						{ (isLarge && !isEmbedded) && <TouchHeaderWrap
							className="hidden-mouse hidden-md-down"
							variant={ TouchHeaderWrap.variants.SOURCE }
						/> }
						<ItemsList isSearchModeTransitioning={ isSearchModeTransitioning } />
						<TouchFooter />
				</Fragment>
			) : (
				<Fragment>
					{ !isEmbedded && <ItemsTableToolbar /> }
					<ItemsTable />
				</Fragment>
			)}
		</div>
    );
};

Items.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default memo(Items);
