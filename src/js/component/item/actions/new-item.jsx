import PropTypes from 'prop-types';
import React, { memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from '../../ui/dropdown';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../ui/button';
import Icon from '../../ui/icon';
import primaryItemTypes from '../../../constants/primary-item-types';
import { createAttachments } from '../../../actions';
import { getFilesData } from '../../../common/event';
import { getPrevSibling, noop } from '../../../utils';

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
	const isFileUploadAllowed = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isFileUploadAllowed);
	const dispatch = useDispatch();
	const uploadFileId = useId();

	const primaryItemTypesDesc = useMemo(() => itemTypes.filter(
		it => primaryItemTypes.includes(it.itemType)
	), [itemTypes]);
	const secondaryItemTypesDesc = useMemo(() => itemTypes.filter(
		it => it.itemType !== 'note' && !primaryItemTypes.includes(it.itemType)
	), [itemTypes]);

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
			<React.Fragment>
				<DropdownItem divider />
				<DropdownItem
					data-no-toggle
					onClick={ handleClick }
					tag="div"
					className="btn-file"
					aria-labelledby={uploadFileId }
				>
					<Button
						className="btn-link upload-file icon-left"
						tabIndex={ -1 }
					>
							<span
								id={ uploadFileId }
								className="flex-row align-items-center"
							>
						Upload File
					</span>
					</Button>
					<input
						aria-labelledby={ uploadFileId }
						data-no-toggle
						multiple={ true }
						onChange={ handleFileInputChange }
						ref={ fileInputRef }
						tabIndex={ -1 }
						type="file"
					/>
				</DropdownItem>
			</React.Fragment>
			)}
			{ isSecondaryVisible ?
				secondaryItemTypesDesc.map(itemTypeSpec => (
					<DropdownItemType
						itemTypeSpec={ itemTypeSpec }
						key={ itemTypeSpec.itemType }
						onNewItemCreate={ onNewItemCreate }
					/>
				)) : (
				<React.Fragment>
					<DropdownItem divider />
					<DropdownItem onClick={ handleToggleMore }>
						More
					</DropdownItem>
				</React.Fragment>
			)}
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
