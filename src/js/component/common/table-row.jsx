import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, useCallback, useId, useRef } from 'react';
import { TitleCell, AttachmentCell, GenericDataCell, PlaceholderCell } from './table-cell';

import { noop } from 'web-common/utils';

const TableRow = props => {
	const { index, style, className = "item", columns, selectedIndexes, getItemData, onSelect = noop, onDoubleClick = noop } = props;
	const id = useId();
	const labelledById = `${id}-title`;
	const ref = useRef();
	const ignoreClicks = useRef({});

	const itemData = getItemData(index);
	const isSelected = selectedIndexes.includes(index);
	const selectedItemKeysLength = selectedIndexes.length;
	const isFirstRowOfSelectionBlock = selectedIndexes.includes(index) && !selectedIndexes.includes(index - 1);
	const isLastRowOfSelectionBlock = selectedIndexes.includes(index) && !selectedIndexes.includes(index + 1);

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	const handleMouseEvent = useCallback(event => {
		if (itemData) {
			if (selectedItemKeysLength > 1 && isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if (selectedItemKeysLength > 1 && isSelected && event.type === 'click') {
					const isFollowUp = index in ignoreClicks.current &&
						Date.now() - ignoreClicks.current[index] < 500;
					if (isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						onSelect(index, event);
						delete ignoreClicks.current[index];
						return
					}
				}
			}
			if (event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[index] = Date.now();
				onSelect(index, event);
			}
			if (event.type === 'dblclick') {
				onDoubleClick(index, event);
			}
		}
	}, [index, isSelected, itemData, onDoubleClick, onSelect, selectedItemKeysLength]);

	return (
		<div
			aria-selected={isSelected}
			aria-rowindex={index + 1}
			aria-labelledby={labelledById}
			className={cx(className, {
				odd: (index + 1) % 2 === 1,
				'nth-4n-1': (index + 2) % 4 === 0,
				'nth-4n': (index + 1) % 4 === 0,
				'active': isSelected,
				'first-active': isFirstRowOfSelectionBlock,
				'last-active': isLastRowOfSelectionBlock,
			})}
			style={style}
			data-index={index}
			onClick={handleMouseEvent}
			onDoubleClick={handleMouseEvent}
			onMouseDown={handleMouseEvent}
			role="row"
			ref={ref}
			tabIndex={-2}
		>
			{columns.map((c, colIndex) => itemData ? (
				c.field === 'title' ? (
					<TitleCell
						labelledById={labelledById}
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						isSelected={isSelected}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				) : c.field === 'attachment' ? (
					<AttachmentCell
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						isSelected={isSelected}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				) : (
					<GenericDataCell
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				)
			) : <PlaceholderCell
				key={c.field}
				width={`var(--col-${colIndex}-width)`}
				colIndex={colIndex}
				isFirstColumn={colIndex === 0}
				isLastColumn={colIndex === columns.length - 1}
				columnName={c.field}
			/>)}
		</div>
	);
};

TableRow.propTypes = {
	data: PropTypes.shape({
		columns: PropTypes.arrayOf(PropTypes.shape({
			field: PropTypes.string.isRequired
		})).isRequired,
		selectedIndexes: PropTypes.arrayOf(PropTypes.number).isRequired,
		getItemData: PropTypes.func.isRequired,
		onSelect: PropTypes.func,
		onDoubleClick: PropTypes.func
	}).isRequired,
	index: PropTypes.number.isRequired,
	style: PropTypes.object,
	className: PropTypes.string
};

export default memo(TableRow);
