import { Fragment, memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'web-common/components';

import { triggerSelectMode, navigate } from '../../../actions';
import { vec2dist } from '../../../utils';
import { PICKS_MULTIPLE_ITEMS } from '../../../constants/picker-modes';

const SELECT_MODE_DELAY = 600; // ms, delay before long press touch triggers select mode
const SELECT_MODE_DEAD_ZONE = 10; // px, moving more than this won't trigger select mode

const ListRow = memo(props => {
	const { data, index, style } = props;
	const { getItemData, selectedItemKeys, pickerMode, pickerNavigate, view, libraryKey, collectionKey } = data;
	const itemKey = getItemData(index);
	const dispatch = useDispatch();
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);

	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isSelectMode = data.isSelectMode || pickerMode === PICKS_MULTIPLE_ITEMS;
	const triggerSelectTimeout = useRef(null);
	const tiggerSelectPosStart = useRef(null);
	const tiggerSelectPosLatest = useRef(null);

	const shouldBeTabbable = (isSingleColumn && view === 'item-list') || !isSingleColumn;

	const { title = '', creator = '', year = '', iconName = '', colors = [], emojis = [], attachmentIconName = '' } = itemData || {};
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const className = cx({
		active: isActive,
		item: true,
		odd: (index + 1) % 2 === 1,
		placeholder: itemKey === null
	});

	const selectItem = useCallback(() => {
		if(!itemKey) {
			return;
		}
		let nextState = {};
		if (isSelectMode) {
			if (selectedItemKeys.includes(itemKey)) {
				nextState = { items: selectedItemKeys.filter(key => key !== itemKey) };
			} else {
				nextState = { items: [...selectedItemKeys, itemKey] };
			}

		} else {
			nextState = { items: [itemKey], view: 'item-details' };
		}

		if (pickerMode) {
			pickerNavigate({ library: libraryKey, collection: collectionKey, view: 'item-list', ...nextState });
		} else {
			dispatch(navigate({ ...nextState, noteKey: null, attachmentKey: null }));
		}
	}, [collectionKey, dispatch, isSelectMode, itemKey, libraryKey, pickerMode, pickerNavigate, selectedItemKeys]);

	const handleKeyDown = useCallback(ev => {
		if ((ev.key === 'Enter' || (isSelectMode && ev.key === " "))) {
			selectItem();
			ev.preventDefault();
		}
	}, [isSelectMode, selectItem]);

	const startSelectMode = useCallback(itemKey => {
		triggerSelectTimeout.current = null;
		const distance = vec2dist(tiggerSelectPosLatest.current, tiggerSelectPosStart.current);

		if(!isSelectMode && (!distance || (distance && distance < SELECT_MODE_DEAD_ZONE))) {
			dispatch(triggerSelectMode(true));
			dispatch(navigate({ items: [itemKey] }));
		}
	}, [dispatch, isSelectMode]);

	const handleTouchStart = useCallback(ev => {
		if(!isSelectMode && !triggerSelectTimeout.current) {
			triggerSelectTimeout.current = setTimeout(() => startSelectMode(itemKey), SELECT_MODE_DELAY);
			tiggerSelectPosStart.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];
			tiggerSelectPosLatest.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];
		}
	}, [isSelectMode, itemKey, startSelectMode]);

	const handleTouchEnd = useCallback(() => {
		if(triggerSelectTimeout.current) {
			clearTimeout(triggerSelectTimeout.current);
			triggerSelectTimeout.current = null;
		}
	}, []);

	const handleTouchMove = useCallback(ev => {
		tiggerSelectPosLatest.current = [ev.touches[0]?.clientX, ev.touches[0]?.clientY];

		if(triggerSelectTimeout.current) {
			const distance = vec2dist(tiggerSelectPosLatest.current, tiggerSelectPosStart.current);
			if(distance > SELECT_MODE_DEAD_ZONE) {
				clearTimeout(triggerSelectTimeout.current);
				triggerSelectTimeout.current = null;
			}
		}
	}, []);

	return (
        <div
			data-index={ index }
			data-key={ itemKey }
			className={ className }
			style={ style }
			onClick={ selectItem }
			onKeyDown={ handleKeyDown }
			onTouchStart={ handleTouchStart }
			onTouchEnd={ handleTouchEnd }
			onTouchMove={ handleTouchMove }
			tabIndex={ shouldBeTabbable ? 0 : null }
			role={ isSelectMode ? "option" : 'listitem' }
			aria-selected={ isSelectMode ? isActive ? "true" : "false" : null }
		>
			{ isSelectMode && itemKey !== null && (
				<input
					type="checkbox"
					tabIndex={ -1 }
					readOnly
					checked={ isActive }
				/>
			)}
			{ itemKey !== null ?
				<Icon
					type={ `28/item-type/${iconName}` }
					symbol={ (isActive && !isSelectMode) ? `${iconName}-white` : iconName }
					useColorScheme={ (isActive && !isSelectMode) ? false : true}
					colorScheme={ colorScheme }
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/> :
				<Icon
					type={ '28/item-type' }
					width="28"
					height="28"
					className="item-type hidden-xs-down"
				/>
			}
			<div className="flex-column">
				<div className="metadata title">
					{ title }
				</div>
				<div className="metadata creator-year">
					<div className="creator">
						{ creator}
					</div>
					<div className="year">
						{ year }
					</div>
					<div className="icons">
						{
							attachmentIconName && (
								<Fragment>
								<Icon
									type={ `12/item-type/${attachmentIconName}` }
									symbol={ (isActive && !isSelectMode) ? `${attachmentIconName}-white` : itemData.attachmentIconName }
									useColorScheme={ (isActive && !isSelectMode) ? false : true }
									colorScheme={ colorScheme }
									width="12"
									height="12"
								/>  </Fragment>) // eslint-disable-line no-irregular-whitespace
						}
						{ emojis.map(emoji => {
							return <span key={emoji} className="emoji">{emoji}</span>
						}) }
						<span className="tag-circles">
							{ colors.map((color, index) => (
								<Icon
									key={ index }
									type={ index === 0 ? '12/circle' : '12/crescent-circle' }
									symbol={ index === 0 ?
										(!isSelectMode && isActive) ? 'circle-active' : 'circle' :
										(!isSelectMode && isActive) ? 'crescent-circle-active' : 'crescent-circle'
									}
									width="12"
									height="12"
									data-color={ color.toLowerCase() }
									style={ { color } }
								/>
							))}
						</span>
					</div>
				</div>
			</div>
			{ !pickerMode && <Icon type={ '16/chevron-13' } width="16" height="16" /> }
		</div>
    );
});

ListRow.displayName = 'ListRow';

ListRow.propTypes = {
	data: PropTypes.shape({
		getItemData: PropTypes.func.isRequired,
	}),
	index: PropTypes.number,
	style: PropTypes.object,
};

export default ListRow;
