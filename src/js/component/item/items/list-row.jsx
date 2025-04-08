import { Fragment, memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'web-common/components';

import { triggerSelectMode, navigate } from '../../../actions';
import { vec2dist } from '../../../utils';

const SELECT_MODE_DELAY = 600; // ms, delay before long press touch triggers select mode
const SELECT_MODE_DEAD_ZONE = 10; // px, moving more than this won't trigger select mode

const selectItem = (itemKey, selectedItemKeys, isSelectMode, dispatch) => {
	if(isSelectMode) {
		if(selectedItemKeys.includes(itemKey)) {
			dispatch(navigate({ items: selectedItemKeys.filter(key => key !== itemKey), noteKey: null, attachmentKey: null }));
		} else {
			dispatch(navigate({ items: [...selectedItemKeys, itemKey], noteKey: null, attachmentKey: null }));
		}
	} else {
		dispatch(navigate({ items: [itemKey], view: 'item-details', noteKey: null, attachmentKey: null }));
	}
}

const ListRow = memo(props => {
	const { data, index, style } = props;
	const { getItemData } = data;
	const itemKey = getItemData(index);
	const dispatch = useDispatch();
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);

	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	const triggerSelectTimeout = useRef(null);
	const tiggerSelectPosStart = useRef(null);
	const tiggerSelectPosLatest = useRef(null);

	const shouldBeTabbable = (isSingleColumn && view === 'item-list') || !isSingleColumn;
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const { title = '', creator = '', year = '', iconName = '', colors = [], emojis = [], attachmentIconName = '' } = itemData || {};
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const className = cx({
		active: isActive,
		item: true,
		odd: (index + 1) % 2 === 1,
		placeholder: itemKey === null
	});

	const handleClick = useCallback(() => {
		selectItem(itemKey, selectedItemKeys, isSelectMode, dispatch);
	}, [dispatch, isSelectMode, itemKey, selectedItemKeys]);

	const handleKeyDown = useCallback(ev => {
		if ((ev.key === 'Enter' || (isSelectMode && ev.key === " ")) && itemKey) {
			selectItem(itemKey, selectedItemKeys, isSelectMode, dispatch);
			ev.preventDefault();
		}
	}, [dispatch, isSelectMode, itemKey, selectedItemKeys]);

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
			onClick={ handleClick }
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
			<Icon type={ '16/chevron-13' } width="16" height="16" />
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
