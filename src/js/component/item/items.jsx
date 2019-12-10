'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ItemsTableToolbar from './items/toolbar';
import ItemsTable from './items/table';
import ItemsList from './items/list';
import TouchHeaderContainer from '../../container/touch-header';
import TouchFooterContainer from '../../container/touch-footer';
import { useSourceData } from '../../hooks';

const Items = ({ isSearchModeTransitioning }) => {
	const { isFetching, hasChecked } = useSourceData();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	return (
		<div className={
			cx('items-container', { loading: isFetching && !hasChecked })
		}>
			{ isTouchOrSmall ?
				<React.Fragment>
					<TouchHeaderContainer
							className="hidden-mouse hidden-sm-down"
							variant={ TouchHeaderContainer.variants.SOURCE }
						/>
						<ItemsList isSearchModeTransitioning={ isSearchModeTransitioning } />
						<TouchFooterContainer />
				</React.Fragment> :
				<React.Fragment>
					<ItemsTableToolbar />
					<ItemsTable />
				</React.Fragment>
			}
		</div>
	);
}

export default Items;
