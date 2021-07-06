import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { default as Dropdown } from 'reactstrap/lib/Dropdown';
import { default as DropdownToggle } from 'reactstrap/lib/DropdownToggle';
import { default as DropdownMenu } from 'reactstrap/lib/DropdownMenu';
import { default as DropdownItem } from 'reactstrap/lib/DropdownItem';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../ui/button';
import Icon from '../../ui/icon';
import primaryItemTypes from '../../../constants/primary-item-types';
import { createAttachments } from '../../../actions';
import { getFilesData } from '../../../common/event';
import { noop } from '../../../utils';

const DropdownItemType = props => {
	const { itemTypeSpec, onNewItemCreate } = props;
	const { itemType, localized } = itemTypeSpec;

	const handleSelect = useCallback(() => {
		onNewItemCreate(itemType);
	}, [itemType, onNewItemCreate]);

	return (
		<DropdownItem onClick={ handleSelect }>
			{ localized }
		</DropdownItem>
	);
}

const NewItemSelector = props => {
	const { disabled, onFocusNext, onFocusPrev, onNewItemCreate, tabIndex } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);
	const fileInputRef = useRef(null);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const dispatch = useDispatch();

	const primaryItemTypesDesc = useMemo(() => itemTypes.filter(
		it => primaryItemTypes.includes(it.itemType)
	), [itemTypes]);
	const secondaryItemTypesDesc = useMemo(() => itemTypes.filter(
		it => it.itemType !== 'note' && !primaryItemTypes.includes(it.itemType)
	), [itemTypes]);

	const handleToggleDropdown = useCallback(ev => {
		if(disabled || (ev.target && ev.target.dataset.noToggle)) {
			return;
		}

		setIsOpen(!isOpen);
		setIsSecondaryVisible(false);
	}, [disabled, isOpen]);

	const handleToggleMore = useCallback(ev => {
		setIsSecondaryVisible(true);
		ev.preventDefault();
	}, []);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [onFocusNext, onFocusPrev]);

	const handleFileInputChange = useCallback(async ev => {
		const filesData = await getFilesData(Array.from(ev.currentTarget.files));
		dispatch(createAttachments(filesData, { collection: collectionKey }));
		setIsOpen(!isOpen);
		setIsSecondaryVisible(false);
	}, [collectionKey, dispatch, isOpen]);

	const handleClick = useCallback(ev => {
		if(ev.currentTarget === ev.target) {
			fileInputRef.current.click();
		}
		ev.stopPropagation();
	}, []);

	return (
		<Dropdown
			className="new-item-selector"
			isOpen={ isOpen }
			toggle={ handleToggleDropdown }
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				color={ null }
				disabled={ disabled }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
				title="New Item"
			>
				<Icon type={ '16/plus' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu modifiers={{
				setMaxHeight: {
					enabled: true,
					order: 890,
					fn: (data) => {
						return {
							...data,
							styles: {
								...data.styles,
								overflow: 'auto',
								maxHeight: 330,
							},
						};
					},
				},
			}}
			>

			{ primaryItemTypesDesc.map(itemTypeSpec => (
				<DropdownItemType
					itemTypeSpec={ itemTypeSpec }
					key={ itemTypeSpec.itemType }
					onNewItemCreate={ onNewItemCreate }
				/>
			)) }
			<DropdownItem divider />
			<DropdownItem data-no-toggle onClick={ handleClick } tag="div" className="btn-file">
				<Button
					className="btn-link upload-file icon-left"
					tabIndex={ -1 }
				>
				<span className="flex-row align-items-center">
					Upload File
				</span>
				</Button>
				<input
					data-no-toggle
					multiple={ true }
					onChange={ handleFileInputChange }
					ref={ fileInputRef }
					tabIndex={ -1 }
					type="file"
				/>
			</DropdownItem>
			<DropdownItem divider />
			{ isSecondaryVisible ?
				secondaryItemTypesDesc.map(itemTypeSpec => (
					<DropdownItemType
						itemTypeSpec={ itemTypeSpec }
						key={ itemTypeSpec.itemType }
						onNewItemCreate={ onNewItemCreate }
					/>
				)) :
				<DropdownItem data-no-toggle onClick={ handleToggleMore }>
					More
				</DropdownItem>
			}
			</DropdownMenu>
		</Dropdown>
	);
}

DropdownItemType.propTypes = {
	itemTypeSpec: PropTypes.object,
	onNewItemCreate: PropTypes.func,
};

NewItemSelector.defaultProps = {
	itemTypes: [],
	onFocusNext: noop,
	onFocusPrev: noop,
	onNewItemCreate: noop,
};

NewItemSelector.propTypes = {
	disabled: PropTypes.bool,
	itemTypes: PropTypes.array,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onNewItemCreate: PropTypes.func,
	tabIndex: PropTypes.number,
};

export default memo(NewItemSelector);
