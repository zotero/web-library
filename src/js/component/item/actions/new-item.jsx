import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useMemo, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useSelector } from 'react-redux';
import { noop } from 'web-common/utils';

import { primaryItemTypes } from '../../../constants/item-types';
import { getPrevSibling } from '../../../utils';
import UploadAction from './upload';

const DropdownItemType = props => {
	const { itemTypeOption, onNewItemCreate } = props;
	const { value, label } = itemTypeOption;

	const handleSelect = useCallback(() => {
		onNewItemCreate(value);
	}, [onNewItemCreate, value]);

	return (
		<DropdownItem onClick={ handleSelect }>
			{ label }
		</DropdownItem>
	);
}

DropdownItemType.propTypes = {
	itemTypeOption: PropTypes.object,
	onNewItemCreate: PropTypes.func,
};

const NewItemSelector = props => {
	const { disabled, onFocusNext = noop, onFocusPrev = noop, onNewItemCreate = noop, tabIndex } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);
	const itemTypeOptions = useSelector(state => state.meta.itemTypeOptions);
	const isFileUploadAllowed = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isFileUploadAllowed);

	const primaryItemTypesDesc = useMemo(
		() => itemTypeOptions.filter(it => primaryItemTypes.includes(it.value)), [itemTypeOptions]
	);

	const secondaryItemTypesDesc = useMemo(
		() => itemTypeOptions.filter(it => !primaryItemTypes.includes(it.value)), [itemTypeOptions]
	);

	const handleToggleDropdown = useCallback(() => {
		if(disabled) {
			return;
		}

		setIsOpen(!isOpen);
		setIsSecondaryVisible(false);
	}, [disabled, isOpen]);

	const handleToggleMore = useCallback(ev => {
		ev.preventDefault();
		ev.stopPropagation();
		if (ev.type === 'keydown') {
			getPrevSibling(ev.currentTarget, '.dropdown-item').focus();
		}

		setIsSecondaryVisible(true);
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

	return (
		<Dropdown
			className="new-item-selector"
			isOpen={ isOpen }
			onToggle={ handleToggleDropdown }
			maxHeight={ 300 }
			strategy="fixed"
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				disabled={ disabled }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
				title="New Item"
			>
				<Icon type={ '16/plus' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu aria-label="New Item Type Picker">
			{ primaryItemTypesDesc.map(itemTypeOption => (
				<DropdownItemType
					itemTypeOption={ itemTypeOption }
					key={ itemTypeOption.value }
					onNewItemCreate={ onNewItemCreate }
				/>
			)) }
			{ isFileUploadAllowed && (
			<Fragment>
				<DropdownItem divider />
				<UploadAction />
			</Fragment>
			)}
			<DropdownItem divider />
			{ isSecondaryVisible ?
				secondaryItemTypesDesc.map(itemTypeOption => (
					<DropdownItemType
						itemTypeOption={ itemTypeOption }
						key={ itemTypeOption.value }
						onNewItemCreate={ onNewItemCreate }
					/>
				)) : (
				<Fragment>
					<DropdownItem onClick={ handleToggleMore }>
						More
					</DropdownItem>
				</Fragment>
			)}
			</DropdownMenu>
		</Dropdown>
    );
}

DropdownItemType.propTypes = {
	itemTypeSpec: PropTypes.object,
	onNewItemCreate: PropTypes.func,
};

NewItemSelector.propTypes = {
	disabled: PropTypes.bool,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onNewItemCreate: PropTypes.func,
	tabIndex: PropTypes.number,
};

export default memo(NewItemSelector);
