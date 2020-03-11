import React, { memo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Icon from '../../ui/icon';
import { navigate } from '../../../actions';

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
	const { keys } = data;
	const itemKey = keys && keys[index] ? keys[index] : null;
	const dispatch = useDispatch();
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);

	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const view = useSelector(state => state.current.view);
	const isSelectMode = useSelector(state => state.current.isSelectMode);

	const shouldBeTabbable = (isSingleColumn && view === 'item-list') || !isSingleColumn;
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);

	const { title = '', creator = '', year = '', iconName = '', colors = [] } = itemData || {};
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const className = cx({
		active: isActive,
		item: true,
		odd: (index + 1) % 2 === 1,
		placeholder: itemKey === null
	});

	const handleClick = useCallback(() => {
		selectItem(itemKey, selectedItemKeys, isSelectMode, dispatch);
	});

	const handleKeyDown = useCallback(ev => {
		const index = ev.currentTarget.dataset.index;

		if((ev.key === 'Enter' || (isSelectMode && ev.key === " ")) && keys[index]) {
			selectItem(keys[index], selectedItemKeys, isSelectMode, dispatch);
			ev.preventDefault();
		}
	});

	return (
		<div
			data-index={ index }
			data-key={ itemKey }
			className={ className }
			style={ style }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
			tabIndex={ shouldBeTabbable ? 0 : null }
			role={ isSelectMode ? "checkbox" : null }
			aria-checked={ isSelectMode ? isActive ? "true" : "false" : null }
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
					type={ `28/item-types/light/${iconName}` }
					symbol={ isActive && !isSelectMode ? `${iconName}-active` : iconName }
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
							// currently blocked #191
							// <Icon type="16/attachment" width="16" height="16" />
							// <Icon type="16/note-sm" width="16" height="16" />
						}

						{ colors.map((color, index) => (
							<Icon
								key={ color }
								type={ index === 0 ? '12/circle' : '12/crescent-circle' }
								symbol={ index === 0 ?
									isActive ? 'circle-active' : 'circle' :
									isActive ? 'crescent-circle-active' : 'crescent-circle'
								}
								width={ index === 0 ? 12 : 8 }
								height="12"
								style={ { color } }
							/>
						))}
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
		handleBlur: PropTypes.func,
		handleFocus: PropTypes.func,
		keys: PropTypes.array,
	}),
	index: PropTypes.number,
	style: PropTypes.object,
};

export default ListRow;
