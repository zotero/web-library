'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useSelector } from 'react-redux';

import ItemsTableToolbar from './items/toolbar';
import ItemsTable from './items/table2';
import ItemsList from './items/list';
import TouchHeaderContainer from '../../container/touch-header';
import TouchFooterContainer from '../../container/touch-footer';
import { useSourceData } from '../../hooks';
const PAGE_SIZE = 50;

const Items = () => {
	const { isFetching, hasChecked } = useSourceData();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	return (
		<div className={
			cx('items-container', { loading: isFetching && !hasChecked })
		}>
			{ isTouchOrSmall ?
				<React.Fragment>
					<div>TOUCH IS</div>
					<div>TODO</div>
				</React.Fragment> :
				<React.Fragment>
					<ItemsTableToolbar />
					<ItemsTable />
				</React.Fragment>
			}
		</div>
	);
}

// class Items extends React.PureComponent {
// 	componentDidMount() {
// 		const { totalItemsCount, isFetchingItems, onLoadMore, isMetaAvailable } = this.props;
// 		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

// 		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems) {
// 			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
// 		}
// 	}

// 	componentDidUpdate() {
// 		const { totalItemsCount, isError, isFetchingItems, onLoadMore,
// 			isMetaAvailable } = this.props;
// 		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

// 		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems && !isError) {
// 			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
// 		}
// 	}

// 	render() {
// 		const { device, totalItemsCount, isSearchMode } = this.props;
// 		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';


// 	}

// 	static propTypes = {
// 		device: PropTypes.object,
// 		isError: PropTypes.bool,
// 		isFetchingItems: PropTypes.bool,
// 		isMetaAvailable: PropTypes.bool,
// 		onLoadMore: PropTypes.func.isRequired,
// 		totalItemsCount: PropTypes.number,
// 	}
// }

export default Items;
