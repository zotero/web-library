import PropTypes from 'prop-types';
import React, { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import Icon from '../../component/ui/icon';
import { COLLECTION_ADD } from '../../constants/modals';
import { toggleModal } from '../../actions';

const CollectionActions = props => {
	const { collectionKey, collectionHasChildren } = props;
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleNewCollectionClick = useCallback(() => {
		const opts = {};

		if(collectionKey && collectionHasChildren) {
			opts['parentCollectionKey'] = collectionKey
		}

		dispatch(toggleModal(COLLECTION_ADD, true, opts));
	}, [dispatch, collectionHasChildren, collectionKey]);

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
					{ collectionKey && collectionHasChildren ?
						"Add Subcollection" : "New Collection" }
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
