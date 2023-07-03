import PropTypes from 'prop-types';
import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';

import { COLLECTION_ADD } from '../../constants/modals';
import { toggleModal } from '../../actions';

const CollectionActions = props => {
	const { collectionKey, collectionHasChildren } = props;
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const collectionParentKey = useSelector(state => state.libraries[state.current.libraryKey]?.collections?.data[collectionKey]?.parentCollection);
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleNewCollectionClick = useCallback(() => {
		const opts = {};

		if(collectionKey) {
			if(isSingleColumn || (!isSingleColumn && collectionHasChildren)) {
				opts['parentCollectionKey'] = collectionKey;
			} else {
				opts['parentCollectionKey'] = collectionParentKey;
			}
		}

		dispatch(toggleModal(COLLECTION_ADD, true, opts));
	}, [dispatch, collectionKey, collectionHasChildren, collectionParentKey, isSingleColumn]);

	return (
		<Dropdown
			isOpen={ isOpen }
			onToggle={ handleToggleDropdown }
			className="new-item-selector"
			placement="bottom-end"
		>
			<DropdownToggle
				className="btn-link btn-icon dropdown-toggle"
			>
				<Icon
					type="24/options"
					symbol={ isOpen ? 'options-block' : 'options' }
					width="24"
					height="24"
				/>
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem onClick={ handleNewCollectionClick }>
					{ collectionKey && (isSingleColumn || (!isSingleColumn && (collectionHasChildren || (!collectionHasChildren && collectionParentKey)))) ?
						"Add Subcollection" : "New Collection"
					}
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

CollectionActions.propTypes = {
	collectionHasChildren: PropTypes.bool,
	collectionKey: PropTypes.string,
}

export default memo(CollectionActions);
