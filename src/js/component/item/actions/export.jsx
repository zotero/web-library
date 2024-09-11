import PropTypes from 'prop-types';
import { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import fileSaver from 'file-saver';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';

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

ExportActionsItem.propTypes = {
	format: PropTypes.shape({
		key: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		extension: PropTypes.string
	}).isRequired
};


const ExportActions = ({ disabled, onFocusNext, onFocusPrev, tabIndex }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(isOpen => !isOpen);
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
			isOpen={ isOpen }
			onToggle={ handleToggleDropdown }
			placement="bottom-start"
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				disabled={ disabled }
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

ExportActions.propTypes = {
	disabled: PropTypes.bool,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	tabIndex: PropTypes.number
};

export default memo(ExportActions);
