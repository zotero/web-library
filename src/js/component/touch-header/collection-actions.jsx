'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../utils');
const Icon = require('../../component/ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;
const { COLLECTION_ADD } = require('../../constants/modals');

class CollectionActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown = () => {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleNewCollectionClick = () => {
		const { toggleModal } = this.props;
		toggleModal(COLLECTION_ADD, true)
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown }
				className="dropdown-wrapper new-item-selector"
			>
				<DropdownToggle
					color={ null }
					className="btn-link dropdown-toggle"
				>
					<Icon type="24/options" width="24" height="24" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem onClick={ this.handleNewCollectionClick }>
						New Collection
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		toggleModal: noop
	}

	static propTypes = {
		toggleModal: PropTypes.func.isRequired,
	}
}

module.exports = CollectionActions;
