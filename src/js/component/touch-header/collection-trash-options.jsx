import { Fragment, memo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';

import { ToolGroup } from '../ui/toolbars';
import { currentRecoverFromTrash, currentDeletePermanently, navigate } from '../../actions';

const CollectionTrashOptions = ({ isSingleColumn, shouldHideNav, }) => {
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleRestoreToLibrary = useCallback(() => {
		dispatch(currentRecoverFromTrash());
		dispatch(navigate({ items: [], view: 'item-list' }));
	}, [dispatch]);

	const handleDeletePermanently = useCallback(() => {
		dispatch(currentDeletePermanently());
		dispatch(navigate({ items: [], view: 'item-list' }));
	}, [dispatch]);

	return (
		isSingleColumn ? (
			<div className="toolbar-right">
				<ToolGroup>
					<Dropdown
						isOpen={isOpen}
						onToggle={handleToggleDropdown}
						className="collection-trash-options"
						placement="bottom-end"
					>
						<DropdownToggle
							className="btn-link btn-icon dropdown-toggle"
						>
							<Icon
								type="24/options"
								symbol={isOpen ? 'options-block' : 'options'}
								width="24"
								height="24"
							/>
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem onClick={handleRestoreToLibrary} >
								Restore to Library
							</DropdownItem>
							<DropdownItem onClick={handleDeletePermanently}>
								Delete Permanently
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</ToolGroup>
			</div>
		) : shouldHideNav ? (
			<Fragment>
				<div className="toolbar-left">
					<ToolGroup>
						<Button className="btn-transparent-secondary" onClick={handleRestoreToLibrary}>
							Restore to Library
						</Button>
					</ToolGroup>
				</div>
				<div className="toolbar-right">
					<ToolGroup>
						<Button className="btn-transparent-secondary" onClick={handleDeletePermanently}>
							Delete Permanently
						</Button>
					</ToolGroup>
				</div>
			</Fragment>
		) : (
			<div className="toolbar-right">
				<ToolGroup>
					<Button className="btn-transparent-secondary" onClick={handleRestoreToLibrary}>
						Restore to Library
					</Button>
					<Button className="btn-transparent-secondary" onClick={handleDeletePermanently}>
						Delete Permanently
					</Button>
				</ToolGroup>
			</div>
		)
	)
}
CollectionTrashOptions.propTypes = {
	isSingleColumn: PropTypes.bool.isRequired,
	shouldHideNav: PropTypes.bool.isRequired,
};

export default memo(CollectionTrashOptions);
