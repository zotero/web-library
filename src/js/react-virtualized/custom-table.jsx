'use strict';

import React from 'react';
import clsx from 'classnames';
import SortDirection from 'react-virtualized/dist/commonjs/Table/SortDirection';
import Table from 'react-virtualized/dist/commonjs/Table';

//@NOTE: copy-pasted `_createHeader` from original react-virtualized Table
//		 implementation in order to override headerTabIndex (we only want the
//		 first cell of the header focusable as per ARIA guidelines)
export default class CustomTable extends Table {
	_createHeader({column, index}) {
		const {
			headerClassName,
			headerStyle,
			onHeaderClick,
			sort,
			sortBy,
			sortDirection,
		} = this.props;
		const {
			columnData,
			dataKey,
			defaultSortDirection,
			disableSort,
			headerRenderer,
			id,
			label,
		} = column.props;
		const sortEnabled = !disableSort && sort;

		const classNames = clsx(
			'ReactVirtualized__Table__headerColumn',
			headerClassName,
			column.props.headerClassName,
			{
				ReactVirtualized__Table__sortableHeaderColumn: sortEnabled,
			},
			);
		const style = this._getFlexStyleForColumn(column, {
			...headerStyle,
			...column.props.headerStyle,
		});

		const renderedHeader = headerRenderer({
			columnData,
			dataKey,
			disableSort,
			label,
			sortBy,
			sortDirection,
		});

		let headerOnClick,
		headerOnKeyDown,
		headerTabIndex,
		headerAriaSort,
		headerAriaLabel;

		if (sortEnabled || onHeaderClick) {
      // If this is a sortable header, clicking it should update the table data's sorting.
      const isFirstTimeSort = sortBy !== dataKey;

      // If this is the firstTime sort of this column, use the column default sort order.
      // Otherwise, invert the direction of the sort.
      const newSortDirection = isFirstTimeSort
      ? defaultSortDirection
      : sortDirection === SortDirection.DESC
      ? SortDirection.ASC
      : SortDirection.DESC;

      const onClick = event => {
		sortEnabled &&
		sort({
			defaultSortDirection,
			event,
			sortBy: dataKey,
			sortDirection: newSortDirection,
		});
		onHeaderClick && onHeaderClick({columnData, dataKey, event});
      };

      const onKeyDown = event => {
		if (event.key === 'Enter' || event.key === ' ') {
			onClick(event);
		}
      };

      headerAriaLabel = column.props['aria-label'] || label || dataKey;
      headerAriaSort = 'none';
      // headerTabIndex = index === 0 ? 0 : null;
      headerOnClick = onClick;
      headerOnKeyDown = onKeyDown;
  }

  if (sortBy === dataKey) {
	headerAriaSort =
	sortDirection === SortDirection.ASC ? 'ascending' : 'descending';
  }

    // Avoid using object-spread syntax with multiple objects here,
    // Since it results in an extra method call to 'babel-runtime/helpers/extends'
    // See PR https://github.com/bvaughn/react-virtualized/pull/942
    return (
		<div
			aria-label={headerAriaLabel}
			aria-sort={headerAriaSort}
			className={classNames}
			id={id}
			key={'Header-Col' + index}
			onClick={headerOnClick}
			onKeyDown={headerOnKeyDown}
			role="columnheader"
			style={style}
			tabIndex={ -2 }
		>
			{renderedHeader}
		</div>
		);
	}
}
