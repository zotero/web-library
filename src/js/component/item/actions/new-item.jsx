import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useMemo, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useSelector } from 'react-redux';
import { noop } from 'web-common/utils';

import primaryItemTypes from '../../../constants/primary-item-types';
import { getPrevSibling } from '../../../utils';
import UploadAction from './upload';

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
	const { disabled, onFocusNext = noop, onFocusPrev = noop, onNewItemCreate = noop, tabIndex } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [isSecondaryVisible, setIsSecondaryVisible] = useState(false);
	const itemTypes = useSelector(state => state.meta.itemTypes);
	const isFileUploadAllowed = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isFileUploadAllowed);

	const primaryItemTypesDesc = useMemo(() => {
		const primaryTypes = itemTypes.filter(
			it => primaryItemTypes.includes(it.itemType)
		);
		primaryTypes.sort((a, b) => a.localized.localeCompare(b.localized));
		return primaryTypes;

	}, [itemTypes]);
	const secondaryItemTypesDesc = useMemo(() => {
		const secondaryTypes = itemTypes.filter(
			it => it.itemType !== 'note' && !primaryItemTypes.includes(it.itemType)
		);
		secondaryTypes.sort((a, b) => a.localized.localeCompare(b.localized));
		return secondaryTypes;
	}, [itemTypes]);

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
			<DropdownMenu>

			{ primaryItemTypesDesc.map(itemTypeSpec => (
				<DropdownItemType
					itemTypeSpec={ itemTypeSpec }
					key={ itemTypeSpec.itemType }
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
				secondaryItemTypesDesc.map(itemTypeSpec => (
					<DropdownItemType
						itemTypeSpec={ itemTypeSpec }
						key={ itemTypeSpec.itemType }
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
