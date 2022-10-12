import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fileSaver from 'file-saver';

import Icon from '../../ui/icon';
import Dropdown from 'reactstrap/es/Dropdown';
import DropdownToggle from 'reactstrap/es/DropdownToggle';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import DropdownItem from 'reactstrap/es/DropdownItem';
import exportFormats from '../../../constants/export-formats';
import { currentExportItems } from '../../../actions';

const { saveAs } = fileSaver;

const ExportActionsItem = ({ format }) => {
	const dispatch = useDispatch();
	const handleSelect = useCallback(async () => {
		const exportData = await dispatch(currentExportItems(format.key));
		const fileName = ['export-data', format.extension].filter(Boolean).join('.');
		saveAs(exportData, fileName);
	}, [dispatch, format]);

	return (
		<DropdownItem onClick={ handleSelect }>
			{ format.label }
		</DropdownItem>
	);
}

const ExportActions = ({ onFocusNext, onFocusPrev, tabIndex }) => {
	const [isOpen, setIsOpen] = useState(false);
	const itemKeysLength = useSelector(state => state.current.itemKeys.length);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);


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
		<Dropdown isOpen={ isOpen } toggle={ handleToggleDropdown } >
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				color={ null }
				disabled={ itemKeysLength === 0 || itemKeysLength > 100 }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
				title="Export"
			>
				<Icon type={ '16/export' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu>
				{
					exportFormats.map(exportFormat => <ExportActionsItem key={ exportFormat.key } format={ exportFormat } />)
				}
			</DropdownMenu>
		</Dropdown>
	);
}

export default memo(ExportActions);
