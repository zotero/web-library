import cx from 'classnames';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'web-common/utils';
import { useSelector } from 'react-redux';
import { Icon } from 'web-common/components';

import colorNames from '../../constants/color-names';
import { renderItemTitle } from '../../common/format';

const Cell = ({ children, className, columnName, index, isFirstColumn, isLastColumn, width, style = {}, ...rest }) => {
	width = rest['aria-role'] === 'columnheader' ? width : (isFirstColumn || isLastColumn) ? `calc(${width} - 8px)` : width;

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

Cell.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	columnName: PropTypes.string,
	index: PropTypes.number,
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	style: PropTypes.object,
};


const TableCellIcon = ({ iconName, suffix = "white", ...rest }) => {
	// Render two icons: one for the focused+selected state and one for the
	// unfocused state. Visibility is controlled via CSS.
	return (
		<>
			<Icon
				{...rest}
				className="focused-selected-icon"
				symbol={`${iconName}-${suffix}`}
				useColorScheme={false}
			/>
			<Icon
				{...rest}
				className="unfocused-icon"
				symbol={iconName}
				useColorScheme={true}
			/>
		</>
	);
}

TableCellIcon.propTypes = {
	iconName: PropTypes.string.isRequired,
	suffix: PropTypes.string,
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

TableCellTagCircles.propTypes = {
	itemData: PropTypes.object.isRequired,
};

export const TitleCell = memo(props => {
	const { columnName, labelledById, itemData, ...rest } = props;
	const formattedSpan = document.createElement('span');
	renderItemTitle(itemData[columnName], formattedSpan);

	const colorScheme = useSelector(state => state.preferences.colorScheme);

	return (
		<Cell
			columnName={columnName}
			{...pick(rest, ['colIndex', 'width', 'isFirstColumn', 'isLastColumn'])}
		>
			<TableCellIcon
				iconName={itemData.iconName}
				label={`${itemData.itemType} icon`}
				type={`16/item-type/${itemData.iconName}`}
				usePixelRatio={true}
				colorScheme={colorScheme}
				width="16"
				height="16"
			/>
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

TitleCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string.isRequired,
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool,
	isSelected: PropTypes.bool,
	itemData: PropTypes.object,
	labelledById: PropTypes.string,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export const AttachmentCell = memo(props => {
	const { columnName, itemData } = props;
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	return (
		<Cell
			aria-label={itemData.attachmentTypeLabel}
			columnName={columnName}
			{...pick(props, ['colIndex', 'width', 'isFirstColumn', 'isLastColumn'])}
		>
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

AttachmentCell.propTypes = {
	columnName: PropTypes.string.isRequired,
	itemData: PropTypes.object,
	colIndex: PropTypes.number,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool,
};

export const GenericDataCell = memo(props => {
	const { columnName, itemData } = props;

	return (
		<Cell
			columnName={columnName}
			{...pick(props, ['colIndex', 'width', 'isFirstColumn', 'isLastColumn'])}
		>
			<div className="truncate">
				{itemData[columnName]}
			</div>
		</Cell>
	);
});

GenericDataCell.displayName = 'GenericDataCell';

GenericDataCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string,
	itemData: PropTypes.object,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};


export const PlaceholderCell = props => {
	const { columnName } = props;
	return (
		<Cell
			{...pick(props, ['colIndex', 'columnName', 'width', 'isFirstColumn', 'isLastColumn'])}
		>
			{columnName === 'title' && <div className="placeholder-icon" />}
			<div className="placeholder" />
		</Cell>
	);
}

PlaceholderCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Cell;
