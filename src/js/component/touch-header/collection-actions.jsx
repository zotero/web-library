import PropTypes from 'prop-types';
import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Dropdown from 'reactstrap/es/Dropdown';
import DropdownItem from 'reactstrap/es/DropdownItem';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import DropdownToggle from 'reactstrap/es/DropdownToggle';
import Icon from '../../component/ui/icon';
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
			toggle={ handleToggleDropdown }
			className="new-item-selector"
		>
			<DropdownToggle
				color={ null }
				className="btn-link btn-icon dropdown-toggle"
			>
				<Icon
					type="24/options"
					symbol={ isOpen ? 'options-block' : 'options' }
					width="24"
					height="24"
				/>
			</DropdownToggle>
			<DropdownMenu right>
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
