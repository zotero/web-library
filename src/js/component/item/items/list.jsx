import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';

import Spinner from '../../ui/spinner';
import { useSourceData } from '../../../hooks';
import { fetchSource } from '../../../actions';
import ListRow from './list-row';

const ROWHEIGHT = 61;

const ItemsList = memo(props => {
	const { isSearchModeTransitioning } = props;
	const loader = useRef(null);
	const [focusedRow, setFocusedRow] = useState(null);
	const dispatch = useDispatch();
	const { hasChecked, isFetching, keys, totalResults } = useSourceData();
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const columnsData = useSelector(state => state.preferences.columns, shallowEqual);
	const isSearchModeTransitioningOut = !isSearchMode && isSearchModeTransitioning;

	//@NOTE: On mobiles (single-column) we have a dedicated search mode where. To prevent visual glitches
	//		 where current items overlap empty search prompt we need the following hack. See #230
	const isSearchModeHack = isSingleColumn && (isSearchMode || isSearchModeTransitioningOut) &&
		itemsSource !== 'query' && view !== 'item-list';

	const { field: sortBy, sort: sortDirection } = useMemo(() =>
		columnsData.find(column => 'sort' in column) || { field: 'title', sort: 'ASC' },
		[columnsData]
	);

	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const isLastItemFocused = totalResults && focusedRow === totalResults - 1;
	const isLastItemSelected = totalResults && keys && keys[totalResults - 1] &&
		selectedItemKeys.includes(keys[totalResults - 1]);

	const handleIsItemLoaded = useCallback(index => keys && !!keys[index]);
	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		dispatch(fetchSource(startIndex, stopIndex))
	});

	const handleFocus = useCallback(ev => {
		const index = parseInt(ev.currentTarget.dataset.index, 10);
		setFocusedRow(index);
	});
	const handleBlur = useCallback(() => {
		setFocusedRow(null);
	});

	useEffect(() => {
		if(!hasChecked && !isFetching) {
			dispatch(fetchSource(0, 50));
		}
	}, []);

	useEffect(() => {
		if(loader.current) {
			loader.current.resetloadMoreItemsCache(true);
		}
	}, [sortBy, sortDirection, totalResults]);

	return (
		<div className="items-list-wrap">
			<AutoSizer>
			{({ height, width }) => (
				<InfiniteLoader
					ref={ loader }
					isItemLoaded={ handleIsItemLoaded }
					itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
					loadMoreItems={ handleLoadMore }
				>
					{({ onItemsRendered, ref }) => (
						<List
							className={ cx('items-list', {
								'editing': isSelectMode,
								'last-item-focus': isLastItemFocused,
								'last-item-active': isLastItemSelected,
							}) }
							height={ height }
							itemCount={ hasChecked && !isSearchModeHack ? totalResults : 0 }
							itemData={ { handleFocus, handleBlur, keys } }
							itemSize={ ROWHEIGHT }
							onItemsRendered={ onItemsRendered }
							ref={ ref }
							width={ width }
						>
							{ ListRow }
						</List>
					)}
				</InfiniteLoader>
			)}
			</AutoSizer>
			{ !hasChecked && !isSearchModeHack && <Spinner className="large" /> }
		</div>
	);
});

ItemsList.displayName = 'ItemsList';

ItemsList.propTypes = {
	isSearchModeTransitioning: PropTypes.bool,
}

export default ItemsList;
