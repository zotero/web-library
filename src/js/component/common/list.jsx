import { memo, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as ReactWindowList } from 'react-window';
import { noop } from 'web-common/utils';

import ListRow from './list-row';
import { alwaysTrue } from '../../utils';
import { SCROLL_BUFFER, LIST_ROW_HEIGHT } from '../../constants/constants';


const List = props => {
	const {
		ariaLabel = "items",
		children,
		containerClassName = null,
		extraItemData = {},
		getItemData,
		isReady = true,
		itemCount,
		listClassName = null,
		loaderRef = null,
		onDoubleClick = noop,
		isItemLoaded = alwaysTrue,
		onLoadMore = noop,
		onSelect = noop,
		role = 'list',
		listItemComponent = null,
		scrollToRow = 0,
		selectedIndexes = [],
		totalResults,
	} = props;

	const ListItemComponent = listItemComponent || ListRow;
	const listRef = useRef(null);

	const itemData = {
		selectedIndexes,
		getItemData,
		onSelect,
		onDoubleClick,
		...extraItemData
	};

	return (
		<div className={cx("items-list-wrap", containerClassName)}>
			{ isReady && (
				<AutoSizer>
					{({ height, width }) => (
						<InfiniteLoader
							ref={loaderRef}
							listRef={listRef}
							isItemLoaded={isItemLoaded}
							itemCount={itemCount}
							loadMoreItems={onLoadMore}
						>
							{({ onItemsRendered, ref }) => (
								<div
									aria-label={ariaLabel}
									className={cx('items-list', listClassName)}
									role={role}
									aria-rowcount={totalResults}
								>
									<ReactWindowList
										initialScrollOffset={Math.max(scrollToRow - SCROLL_BUFFER, 0) * LIST_ROW_HEIGHT}
										height={height}
										itemCount={itemCount}
										itemData={itemData}
										itemSize={LIST_ROW_HEIGHT}
										onItemsRendered={onItemsRendered}
										ref={r => { ref(r); listRef.current = r; props.listRef && (props.listRef.current = r); }}

										width={width}
									>
										{ ListItemComponent }
									</ReactWindowList>
								</div>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			) }
			{ children }
		</div>
	);
}

List.propTypes = {
	ariaLabel: PropTypes.string,
	children: PropTypes.node,
	containerClassName: PropTypes.string,
	extraItemData: PropTypes.object,
	getItemData: PropTypes.func.isRequired,
	isItemLoaded: PropTypes.func,
	isReady: PropTypes.bool,
	itemCount: PropTypes.number.isRequired,
	listClassName: PropTypes.string,
	listItemComponent: PropTypes.elementType,
	listRef: PropTypes.shape({
		current: PropTypes.object,
	}),
	loaderRef: PropTypes.shape({
		current: PropTypes.object,
	}),
	onDoubleClick: PropTypes.func,
	onLoadMore: PropTypes.func,
	onSelect: PropTypes.func,
	role: PropTypes.string,
	scrollToRow: PropTypes.number,
	selectedIndexes: PropTypes.array,
	totalResults: PropTypes.number.isRequired,
};

export default memo(List);
