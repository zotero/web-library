import cx from 'classnames';
import { memo } from 'react';
import { pick } from 'web-common/utils';
import { useSelector } from 'react-redux';
import { Icon } from 'web-common/components';

import colorNames from '../../constants/color-names';
import { renderItemTitle } from '../../common/format';

const Cell = ({ children, className, columnName, index, isLastColumn, width, style = {}, ...rest }) => {
	// Only the last column is narrowed to leave room for the scrollbar gutter.
	// The first column must keep its full width, otherwise every following
	// column is shifted left of its header and content no longer lines up.
	width = rest['aria-role'] === 'columnheader' ? width : isLastColumn ? `calc(${width} - 8px)` : width;

	return (
		<div
			aria-colindex={index}
			className={cx('metadata', columnName, className)}
			data-colindex={index}
			data-column-name={columnName}
			role="gridcell"
			style={{ ...style, width }}
			{...pick(rest, ['onClick', 'onKeyDown', 'tabIndex', 'role'])}
			{...pick(rest, key => key.match(/^(aria-|data-).*/))}
		>
			{children}
		</div>
	)
}


const TableCellIcon = ({ className, iconName, suffix = "white", ...rest }) => {
	// Render two icons: one for the focused+selected state and one for the
	// unfocused state. Visibility is controlled via CSS.
	return (
		<>
			<Icon
				{...rest}
				className={cx('focused-selected-icon', className)}
				symbol={`${iconName}-${suffix}`}
				useColorScheme={false}
			/>
			<Icon
				{...rest}
				className={cx('unfocused-icon', className)}
				symbol={iconName}
				useColorScheme={true}
			/>
		</>
	);
}

const TableCellItemTypeIcon = ({ itemData }) => {
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	return (
		<TableCellIcon
			className="item-type-icon"
			iconName={itemData.iconName}
			label={`${itemData.itemType} icon`}
			type={`16/item-type/${itemData.iconName}`}
			usePixelRatio={true}
			colorScheme={colorScheme}
			width="16"
			height="16"
		/>
	);
}

const TableCellTagCircles = ({ itemData }) => {
	// Render two sets of tag circles: one for the focused+selected state and one
	// for the unfocused state. Visibility is controlled via CSS.
	return (
		<>
			{[true, false].map(isFocused => (
				<span key={isFocused ? 'focused' : 'unfocused'} className={cx('tag-circles', { 'focused-selected-tag-circles': isFocused, 'unfocused-tag-circles': !isFocused })}>
					{(itemData?.colors ?? []).map((color, index) => (
						<Icon
							label={`${colorNames[color] || ''} circle icon`}
							key={index}
							type={index === 0 ? '12/circle' : '12/crescent-circle'}
							symbol={index === 0 ?
								(isFocused ? 'circle-active' : 'circle') :
								(isFocused ? 'crescent-circle-active' : 'crescent-circle')
							}
							width="12"
							height="12"
							data-color={color.toLowerCase()}
							style={{ color }}
						/>
					))}
				</span>
			))}
		</>
	)
}

export const TitleCell = memo(props => {
	const { columnName, labelledById, itemData, ...rest } = props;
	const formattedSpan = document.createElement('span');
	renderItemTitle(itemData[columnName], formattedSpan);

	return (
		<Cell
			columnName={columnName}
			{...pick(rest, ['colIndex', 'width', 'isLastColumn'])}
		>
			{props.colIndex === 0 && <TableCellItemTypeIcon itemData={itemData} />}
			<div className="truncate" id={labelledById} dangerouslySetInnerHTML={{ __html: formattedSpan.outerHTML }} />
			<div className="tag-colors">
				{(itemData?.emojis ?? []).map(emoji => {
					return <span key={emoji} className="emoji">{emoji}</span>
				})}
				<TableCellTagCircles itemData={itemData} />
			</div>
		</Cell>
	);
});

TitleCell.displayName = 'TitleCell';

export const AttachmentCell = memo(props => {
	const { columnName, itemData } = props;
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	return (
		<Cell
			aria-label={itemData.attachmentTypeLabel}
			columnName={columnName}
			{...pick(props, ['colIndex', 'width', 'isLastColumn'])}
		>
			{props.colIndex === 0 && <TableCellItemTypeIcon itemData={itemData} />}
			<div className="truncate">
				{itemData[columnName]}
			</div>
			{itemData.attachmentIconName && (
				<TableCellIcon
					iconName={itemData.attachmentIconName}
					type={`12/item-type/${itemData.attachmentIconName}`}
					colorScheme={colorScheme}
					width="12"
					height="12"
				/>
			)}
		</Cell>
	);
})

AttachmentCell.displayName = 'AttachmentCell';

export const GenericDataCell = memo(props => {
	const { columnName, itemData } = props;

	return (
		<Cell
			columnName={columnName}
			{...pick(props, ['colIndex', 'width', 'isLastColumn'])}
		>
			{props.colIndex === 0 && <TableCellItemTypeIcon itemData={itemData} />}
			<div className="truncate">
				{itemData[columnName]}
			</div>
		</Cell>
	);
});

GenericDataCell.displayName = 'GenericDataCell';


export const PlaceholderCell = props => {
	return (
		<Cell
			{...pick(props, ['colIndex', 'columnName', 'width', 'isLastColumn'])}
		>
			{props.colIndex === 0 && <div className="placeholder-icon" />}
			<div className="placeholder" />
		</Cell>
	);
}

export default Cell;
