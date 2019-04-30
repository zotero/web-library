'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../ui/modal';
import Button from '../ui/button';
import RadioSet from '../form/radio-set';
import columnNames from '../../constants/column-names';

class ItemsSortModal extends React.PureComponent {
	state = { sortColumn: null }
	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen, preferences: { columns } } = this.props;
		const sortColumn = columns.find(c => c.sort) || columns.find(c => c.field === 'title');

		if(!wasOpen && isOpen) {
			this.setState({ sortColumn: sortColumn.field });
		}
	}

	handleConfirmSortChange = () => {
		const { onSort, toggleModal } = this.props;
		const { preferences: { columns } } = this.props;
		const sortColumn = columns.find(c => c.sort);
		onSort({
			sortBy: this.state.sortColumn || sortColumn.field,
			sortDirection: 'ASC'
		});
		toggleModal(null, false);
	}

	handleSortChange = newSortColumn => {
		this.setState({ sortColumn: newSortColumn });
	}

	render() {
		const { isOpen, toggleModal } = this.props;
		const radioSetOptions = Object.entries(columnNames)
			.map(([value, label]) => ({ value, label }));

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Collection Editor"
				className="modal-touch modal-form modal-centered"
				onRequestClose={ () => toggleModal(null, false) }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						<div className="modal-header-left">
							<Button
								className="btn-link"
								onClick={ () => toggleModal(null, false) }
							>
								Cancel
							</Button>
						</div>
						<div className="modal-header-center">
							<h4 className="modal-title truncate">
								Sort By
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								onClick={ this.handleConfirmSortChange }
							>
								Confirm
							</Button>
						</div>
					</div>
					<div className="modal-body">
						<div className="form">
							<RadioSet
								onChange={ this.handleSortChange }
								options={ radioSetOptions }
								value={ this.state.sortColumn }
							/>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		isOpen: PropTypes.bool,
		onSort: PropTypes.func.isRequired,
		preferences: PropTypes.object,
		toggleModal: PropTypes.func.isRequired,
	}
}

export default ItemsSortModal;
