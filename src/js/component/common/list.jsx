import { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useInfiniteLoader } from "react-window-infinite-loader";
import { noop } from 'web-common/utils';

import ReactWindowList from './react-window-list';
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
		listRef = null,
		listClassName = null,
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

	const itemData = {
		selectedIndexes,
		getItemData,
		onSelect,
		onDoubleClick,
		...extraItemData
	};

	const onRowsRendered = useInfiniteLoader({
		isRowLoaded: isItemLoaded,
		rowCount: itemCount,
		loadMoreRows: onLoadMore
	});

	return (
		<div className={cx("items-list-wrap", containerClassName)}>
			{ isReady && (
				<AutoSizer renderProp={({ height, width }) => {
					if(typeof width === 'undefined' || typeof height === 'undefined') {
						return null;
					}
					return (
						<div
							aria-label={ariaLabel}
							className={cx('items-list', listClassName)}
							role={role}
							aria-rowcount={totalResults}
						>
							<ReactWindowList
								rowComponent={ListItemComponent}
								initialScrollToRow={Math.max(scrollToRow - SCROLL_BUFFER, 0)}
								rowCount={itemCount}
								rowProps={itemData}
								rowHeight={LIST_ROW_HEIGHT}
								onRowsRendered={onRowsRendered}
								listRef={listRef}
								style={{ width, height }}
							/>
						</div>
					)
				}} />
			)}
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
	onDoubleClick: PropTypes.func,
	onLoadMore: PropTypes.func,
	onSelect: PropTypes.func,
	role: PropTypes.string,
	scrollToRow: PropTypes.number,
	selectedIndexes: PropTypes.array,
	totalResults: PropTypes.number.isRequired,
};

export default memo(List);
