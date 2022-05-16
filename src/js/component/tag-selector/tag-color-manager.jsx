import cx from 'classnames';
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';

import Icon from '../ui/icon';
import { useFocusManager } from '../../hooks';
import { updateTagColors } from '../../actions';
import ColorPicker from '../ui/color-picker';
import Button from '../ui/button';
import Select from '../form/select';
import { maxColoredTags } from '../../constants/defaults';
import { isTriggerEvent } from '../../common/event';


const colors = ['#FF6666', '#FF8C19', '#999999', '#5FB236', '#009980', '#2EA8E5', '#576DD9', '#A28AE5', '#A6507B' ];

const pickAvailableTagColor = ((colors, tagColorsData) => {
	const tagColors = tagColorsData.map(tgc => tgc.color);
	return colors.find(c => !tagColors.includes(c)) || colors[0];
});

const TagColorManager = ({ onToggleTagManager, tag }) => {
	const dispatch = useDispatch();
	const ref = useRef(null);
	const { lookup: tagColorsLookup, value: tagColors } = useSelector(state => state.libraries[state.current.libraryKey].tagColors)
	const { receiveFocus, receiveBlur, focusDrillDownPrev, focusDrillDownNext } = useFocusManager(ref);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

	const indexInTagColors = tagColors.findIndex(tc => tag === tc.name);
	const options = [...Array.from({ length: tagColors.length }, (_, i) => i), indexInTagColors === -1 ? tagColors.length : null]
		.filter(o => o !== null)
		.map(o => ({ label: (o + 1).toString(), value: o.toString() }));
	const [tagColor, setTagColor] = useState(indexInTagColors === -1 ? pickAvailableTagColor(colors, tagColors) : tagColors[indexInTagColors].color);
	const [position, setPosition] = useState(indexInTagColors === -1 ? tagColors.length : indexInTagColors);

	const handleColorPicked = useCallback(newColor => {
		setTagColor(newColor);
		setIsColorPickerOpen(false);
	}, []);

	const handleCancelClick = useCallback(() => {
		onToggleTagManager(null)
	}, [onToggleTagManager]);

	const handleToggleColorPicker = useCallback(ev => {
		if(isTriggerEvent(ev) || (ev.keydown && ev.key === 'ArrowDown')) {
			setIsColorPickerOpen(!isColorPickerOpen);
		}
	}, [isColorPickerOpen]);

	const handlePositionChange = useCallback(newPosition => {
		setPosition(parseInt(newPosition));
	}, []);

	const handleSetColor = useCallback(() => {
		const newTagColors = [...tagColors];
		if(indexInTagColors !== -1) {
			newTagColors.splice(indexInTagColors, 1);
		}
		newTagColors.splice(position, 0, { name: tag, color: tagColor });
		dispatch(updateTagColors(newTagColors));
		onToggleTagManager(null);
	}, [dispatch, indexInTagColors, onToggleTagManager, position, tag, tagColor, tagColors]);

	const handleRemoveColorClick = useCallback(() => {
		if(indexInTagColors === -1) {
			return;
		}
		const newTagColors = [...tagColors];
		newTagColors.splice(indexInTagColors, 1);
		dispatch(updateTagColors(newTagColors));
		onToggleTagManager(null);
	}, [dispatch, indexInTagColors, onToggleTagManager, tagColors]);

	const handleKeyDown = ev => {
		if(ev.key === 'Escape') {
			onToggleTagManager(null);
			ev.preventDefault();
			ev.stopPropagation();
		}
	}

	const handleBlur = useCallback((ev) => {
		receiveBlur(ev);

		// trap focus inside the tag color manager
		if(ev.relatedTarget && !ev.relatedTarget.closest('.tag-color-manager')) {
			ref.current.querySelector('[tabIndex="0"]').focus();
		}
	}, [receiveBlur])

	const handleToggleBlur = useCallback(ev => {
		if(ev.relatedTarget && !ev.relatedTarget.closest('.color-picker')) {
			setIsColorPickerOpen(false);
		}
	}, []);


	useEffect(() => {
		ref.current.focus();
	}, []);

	return (
		<div
			ref={ ref }
			onBlur={ handleBlur }
			onFocus={ receiveFocus }
			onKeyDown={ handleKeyDown }
			tabIndex="0"
			className="tag-color-manager"
		>
			<div className="form">
				<div className="form-group form-row">
					<label className="col-form-label">Color:</label>
					<div className="col">
						<Dropdown
							isOpen={ isColorPickerOpen }
							toggle={ handleToggleColorPicker }
							className="btn-group"
						>
							<div onClick={ handleToggleColorPicker }
								className="color-swatch"
								style={ { backgroundColor: tagColor } }
							>
							</div>
							<DropdownToggle
								color={ null }
								className="btn-icon dropdown-toggle"
								onKeyDown={ handleToggleColorPicker }
								tabIndex={ 0 }
								onBlur={ handleToggleBlur }
							>
								<Icon type="16/chevron-9" className="touch" width="16" height="16" />
								<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
							</DropdownToggle>
							<ColorPicker
								gridCols={ 3 }
								colors={ colors }
								onColorPicked={ handleColorPicked }
								onDrillDownPrev={ focusDrillDownPrev }
								onDrillDownNext={ focusDrillDownNext }
							/>
						</Dropdown>
					</div>
					<label className="col-form-label">Position:</label>
					<div className="col">
						<Select
							inputGroupClassName={ cx('position-selector') }
							clearable={ false }
							searchable={ false }
							value={ position.toString() }
							tabIndex={ 0 }
							options={ options }
							onChange={ () => true /* commit on change */ }
							onCommit={ handlePositionChange }
						/>
					</div>
				</div>
				<p className="info">
					You can add this tag to selected items by pressing the {position + 1} key on the keyboard.
				</p>
				<p className="info">
					Up to {maxColoredTags} tags in each library can have colors assigned.
				</p>
				<div className="buttons-wrap">
					<div className="left">
						{ indexInTagColors !== -1 && (
						<Button className="btn-default" onClick={ handleRemoveColorClick } >
							Remove Color
						</Button>
						)}
					</div>
					<div className="right">
						<Button className="btn-default" onClick={ handleCancelClick } >
							Cancel
						</Button>
						<Button
							className="btn-default"
							onClick={ handleSetColor }
						>
							Set Color
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(TagColorManager);
