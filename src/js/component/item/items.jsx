'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const ItemsTableToolbar = require('./items/toolbar');
const ItemsTable = require('./items/table');
const ItemsList = require('./items/list');
const TouchHeaderContainer = require('../../container/touch-header');
const TouchFooterContainer = require('../../container/touch-footer');
const Spinner = require('../../component/ui/spinner');
const PAGE_SIZE = 100;

class Items extends React.PureComponent {
	state = {};
	static getDerivedStateFromProps({ itemFields = [] }) {
		return {
			columnNames: {
				...itemFields.reduce((acc, itemField) => {
					acc[itemField.field] = itemField.localized;
					return acc;
				}, {}),
				creator: 'Creator',
				dateAdded: 'Date Added',
				dateModified: 'Date Modified',
				itemType: 'Item Type',
				year: 'Year',
				publication: 'Publication'
			}
		}
	}

	componentDidMount() {
		const { totalItemsCount, isFetchingItems, onLoadMore, isMetaAvailable } = this.props;
		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems) {
			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
		}
	}

	componentDidUpdate() {
		const { totalItemsCount, isFetchingItems, onLoadMore, isMetaAvailable } = this.props;
		const isLoadingUncounted = typeof(totalItemsCount) === 'undefined';

		if(isLoadingUncounted && isMetaAvailable && !isFetchingItems) {
			onLoadMore({ startIndex: 0, stopIndex: 0 + PAGE_SIZE - 1 });
		}
	}

	render() {
		const { device, totalItemsCount, itemsSource } = this.props;
		// if number of total items is unknown, we display spinner instead of a table or list
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
						{ isLoadingUncounted ?
							<Spinner className="large" /> :
							<ItemsList { ...this.props } { ...this.state } />
						}
						<TouchFooterContainer />
					</React.Fragment> :
					<React.Fragment>
						<ItemsTableToolbar { ...this.props } { ...this.state } />
						{ isLoadingUncounted ? (
							<React.Fragment>
								<div className="ReactVirtualized__Grid ReactVirtualized__Table__Grid">
									<Spinner className="large" />
								</div>
							</React.Fragment>
							) :
							<ItemsTable { ...this.props } { ...this.state } />
						}
					</React.Fragment>
				}
			</div>
		)
	}

	static propTypes = {
		device: PropTypes.object,
		isFetchingItems: PropTypes.bool,
		isMetaAvailable: PropTypes.bool,
		onLoadMore: PropTypes.func.isRequired,
		totalItemsCount: PropTypes.number,
	}
}

module.exports = Items;
