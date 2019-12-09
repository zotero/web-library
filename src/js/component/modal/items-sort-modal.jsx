'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../ui/modal';
import Button from '../ui/button';
import RadioSet from '../form/radio-set';
import columnNames from '../../constants/column-names';
import columnSortKeyLookup from '../../constants/column-sort-key-lookup';

class ItemsSortModal extends React.PureComponent {
	state = { sortColumn: null }

	componentDidUpdate(_prevProps, { sortColumn: prevSortColumn }) {
		const { device } = this.props;
		const { sortColumn } = this.state;
		if(sortColumn !== prevSortColumn && !device.isKeyboardUser) {
			this.changeSortColumn();
		}
	}

	static getDerivedStateFromProps({ preferences: { columns } }, { sortColumn }) {
		if(sortColumn) {
			return null;
		}

		return {
			sortColumn: (columns.find(c => c.sort) || columns.find(c => c.field === 'title') || {}).field
		}
	}

	handleSortChange = newSortColumn => {
		this.setState({ sortColumn: newSortColumn });
	}

	changeSortColumn = () => {
		const { toggleModal, updateItemsSorting } = this.props;
		const { preferences: { columns } } = this.props;
		const sortColumn = columns.find(c => c.sort);

		updateItemsSorting(
			this.state.sortColumn || sortColumn.field,
			'asc'
		)

		toggleModal(null, false);
	}

	render() {
		const { isOpen, toggleModal, device } = this.props;
		const radioSetOptions = Object.entries(columnNames)
			.map(([value, label]) => ({ value, label }))
			.filter(({ value }) => columnSortKeyLookup[value]); // skip unsortable columns

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
							{
								device.isKeyboardUser && (
									<Button
										className="btn-link"
										onClick={ this.changeSortColumn }
									>
										Confirm
									</Button>
								)
							}
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
		device: PropTypes.object,
		isOpen: PropTypes.bool,
		preferences: PropTypes.object,
		toggleModal: PropTypes.func.isRequired,
		updateItemsSorting: PropTypes.func.isRequired,
	}
}

export default ItemsSortModal;
