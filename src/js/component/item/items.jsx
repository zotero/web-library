'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ItemsTableToolbar from './items/toolbar';
import ItemsTable from './items/table';
import ItemsList from './items/list';
import TouchHeaderContainer from '../../container/touch-header';
import TouchFooterContainer from '../../container/touch-footer';
const PAGE_SIZE = 50;

class Items extends React.PureComponent {
	componentDidMount() {
		const { totalItemsCount, isFetchingItems, onLoadMore, isMetaAvailable } = this.props;
		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems) {
			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
		}
	}

	componentDidUpdate() {
		const { totalItemsCount, isError, isFetchingItems, onLoadMore,
			isMetaAvailable } = this.props;
		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems && !isError) {
			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
		}
	}

	render() {
		const { device, totalItemsCount } = this.props;
		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

		return (
			<div className={
				cx('items-container', { loading: isLoadingUncounted })
			}>
				{ device.isTouchOrSmall ?
					<React.Fragment>
						<TouchHeaderContainer
							className="hidden-mouse hidden-sm-down"
							variant={ TouchHeaderContainer.variants.SOURCE }
						/>
						<ItemsList { ...this.props } />
						<TouchFooterContainer />
					</React.Fragment> :
					<React.Fragment>
						<ItemsTableToolbar { ...this.props } />
						<ItemsTable { ...this.props } />
					</React.Fragment>
				}
			</div>
		)
	}

	static propTypes = {
		device: PropTypes.object,
		isError: PropTypes.bool,
		isFetchingItems: PropTypes.bool,
		isMetaAvailable: PropTypes.bool,
		onLoadMore: PropTypes.func.isRequired,
		totalItemsCount: PropTypes.number,
	}
}

export default Items;
