import { Fragment, memo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'web-common/components';
import { noop } from 'web-common/utils';

import { vec2dist } from '../../utils';

const SELECT_MODE_DELAY = 600; // ms, delay before long press touch triggers select mode
const SELECT_MODE_DEAD_ZONE = 10; // px, moving more than this won't trigger select mode


const ListRow = props => {
	const { data, index, style, className } = props;
	const { isSelectMode, selectedIndexes, getItemData, onSelect = noop,
		onTriggerSelectMode = noop, tabIndex = null } = data;
	const itemData = getItemData(index);
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	const triggerSelectTimeout = useRef(null);
	const tiggerSelectPosStart = useRef(null);
	const tiggerSelectPosLatest = useRef(null);

	const { title = '', creator = '', year = '', iconName = '', colors = [], emojis = [], attachmentIconName = '' } = itemData || {};
	const isSelected = selectedIndexes.includes(index);
	const isActive = !!itemData && isSelected;

	const handleClick = useCallback((ev) => {
		onSelect(index, ev);
	}, [index, onSelect]);

	const handleKeyDown = useCallback(ev => {
		const index = ev.currentTarget.dataset.index;

		if ((ev.key === 'Enter' || (isSelectMode && ev.key === " ")) && !!itemData) {
			onSelect(index, ev);
			ev.preventDefault();
		}
	}, [isSelectMode, itemData, onSelect]);

	const startSelectMode = useCallback(() => {
		triggerSelectTimeout.current = null;
		const distance = vec2dist(tiggerSelectPosLatest.current, tiggerSelectPosStart.current);

		if (!isSelectMode && (!distance || (distance && distance < SELECT_MODE_DEAD_ZONE))) {
			onTriggerSelectMode(true, index);
		}
	}, [index, isSelectMode, onTriggerSelectMode]);

	const handleTouchStart = useCallback(ev => {
		if (!isSelectMode && !triggerSelectTimeout.current) {
			triggerSelectTimeout.current = setTimeout(() => startSelectMode(), SELECT_MODE_DELAY);
			tiggerSelectPosStart.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];
			tiggerSelectPosLatest.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];
		}
	}, [isSelectMode, startSelectMode]);

	const handleTouchEnd = useCallback(() => {
		if (triggerSelectTimeout.current) {
			clearTimeout(triggerSelectTimeout.current);
			triggerSelectTimeout.current = null;
		}
	}, []);

	const handleTouchMove = useCallback(ev => {
		tiggerSelectPosLatest.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];

		if (triggerSelectTimeout.current) {
			const distance = vec2dist(tiggerSelectPosLatest.current, tiggerSelectPosStart.current);
			if (distance > SELECT_MODE_DEAD_ZONE) {
				clearTimeout(triggerSelectTimeout.current);
				triggerSelectTimeout.current = null;
			}
		}
	}, []);

	return (
		<div
			data-index={index}
			className={cx('item', className, {
				active: isActive,
				odd: (index + 1) % 2 === 1,
				placeholder: !!itemData === null,
			})}
			style={style}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchMove={handleTouchMove}
			tabIndex={tabIndex}
			role={isSelectMode ? "option" : 'listitem'}
			aria-selected={isSelectMode ? isActive ? "true" : "false" : null}
		>
			{isSelectMode && itemData !== null && (
				<input
					type="checkbox"
					tabIndex={-1}
					readOnly
					checked={isActive}
				/>
			)}
			{itemData !== null ?
				<Icon
					type={`28/item-type/${iconName}`}
					symbol={(isActive && !isSelectMode) ? `${iconName}-white` : iconName}
					useColorScheme={(isActive && !isSelectMode) ? false : true}
					colorScheme={colorScheme}
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/> :
				<Icon
					type={'28/item-type'}
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/>
			}
			<div className="flex-column">
				<div className="metadata title">
					{title}
				</div>
				<div className="metadata creator-year">
					<div className="creator">
						{creator}
					</div>
					<div className="year">
						{year}
					</div>
					<div className="icons">
						{
							attachmentIconName && (
								<Fragment>
									<Icon
										type={`12/item-type/${attachmentIconName}`}
										symbol={(isActive && !isSelectMode) ? `${attachmentIconName}-white` : itemData.attachmentIconName}
										useColorScheme={(isActive && !isSelectMode) ? false : true}
										colorScheme={colorScheme}
										width="12"
										height="12"
									/>  </Fragment>) // eslint-disable-line no-irregular-whitespace
						}
						{emojis.map(emoji => {
							return <span key={emoji} className="emoji">{emoji}</span>
						})}
						<span className="tag-circles">
							{colors.map((color, index) => (
								<Icon
									key={index}
									type={index === 0 ? '12/circle' : '12/crescent-circle'}
									symbol={index === 0 ?
										(!isSelectMode && isActive) ? 'circle-active' : 'circle' :
										(!isSelectMode && isActive) ? 'crescent-circle-active' : 'crescent-circle'
									}
									width="12"
									height="12"
									data-color={color.toLowerCase()}
									style={{ color }}
								/>
							))}
						</span>
					</div>
				</div>
			</div>
			<Icon type={'16/chevron-13'} width="16" height="16" />
		</div>
	);
};

ListRow.displayName = 'ListRow';

ListRow.propTypes = {
	data: PropTypes.shape({
			isSelectMode: PropTypes.bool,
			isFocusedAndSelected: PropTypes.bool,
			selectedIndexes: PropTypes.arrayOf(PropTypes.number),
			getItemData: PropTypes.func.isRequired,
			onSelect: PropTypes.func,
			onTriggerSelectMode: PropTypes.func,
			tabIndex: PropTypes.number
		}).isRequired,
	index: PropTypes.number.isRequired,
	style: PropTypes.object,
	className: PropTypes.string
};

export default memo(ListRow);
