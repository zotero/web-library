'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../utils';
import Icon from '../../component/ui/icon';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import { COLLECTION_ADD } from '../../constants/modals';

class CollectionActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown = () => {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleNewCollectionClick = () => {
		const { toggleModal, collectionKey, collectionHasChildren } = this.props;
		const opts = {};

		if(collectionKey && collectionHasChildren) {
			opts['parentCollectionKey'] = collectionKey
		}

		toggleModal(COLLECTION_ADD, true, opts);
	}


	render() {
		const { collectionKey, collectionHasChildren } = this.props;
		const { isOpen } = this.state;
		return (
			<Dropdown
				isOpen={ isOpen }
				toggle={ this.handleToggleDropdown }
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
					<DropdownItem onClick={ this.handleNewCollectionClick }>
						{ collectionKey && collectionHasChildren ?
							"Add Subcollection" : "New Collection" }
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		toggleModal: noop
	}

	static propTypes = {
		collectionHasChildren: PropTypes.bool,
		collectionKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
	}
}

export default CollectionActions;
