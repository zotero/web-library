import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useDispatch, useSelector } from 'react-redux';
import { noop } from 'web-common/utils';

import primaryItemTypes from '../../../constants/primary-item-types';
import { createAttachments } from '../../../actions';
import { getFilesData } from '../../../common/event';
import { getPrevSibling } from '../../../utils';

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
			<Fragment>
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
			</Fragment>
			)}
			{ isSecondaryVisible ?
				secondaryItemTypesDesc.map(itemTypeSpec => (
					<DropdownItemType
						itemTypeSpec={ itemTypeSpec }
						key={ itemTypeSpec.itemType }
						onNewItemCreate={ onNewItemCreate }
					/>
				)) : (
				<Fragment>
					<DropdownItem divider />
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
