'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Field from './field';
import Editable from '../editable';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Input from './input';
import SelectInput from './select';
import { creator as formatCreator } from '../../common/format';
import Modal from '../ui/modal';

class CreatorField extends React.PureComponent {
	constructor(props) {
		super(props);
		const { device: { shouldUseModalCreatorField, shouldUseEditMode },
		isEditing, shouldPreOpenModal } = props;
		this.state = {
			active: null,
			isModalVisible: shouldUseModalCreatorField && shouldUseEditMode &&
				isEditing && shouldPreOpenModal
		};
		this.fieldComponents = {};
	}

	focus() {
		const key = 'lastName' in this.props.creator ? 'lastName' : 'name';
		if(!this.props.isForm) {
			this.setState({ active: key });
		} else {
			key in this.fieldComponents && this.fieldComponents[key].focus();
		}
	}

	handleFieldClick(key) {
		this.setState({ active: key });
	}

	handleFieldFocus(key) {
		this.setState({
			active: key,
		});
	}

	handleCancel() {
		this.setState({ active: null });
	}

	handleEditableCommit(field, newValue, hasChanged, srcEvent) {
		if(hasChanged) {
			this.props.onChange(this.props.index, field, newValue);
		}
		if(this.props.isForm && srcEvent) {
			if(srcEvent.type == 'keydown' && srcEvent.key == 'Enter') {
				srcEvent.target.blur();
			}
		}
		this.setState({ active: null });
	}

	handleCreatorTypeSwitch() {
		this.props.onCreatorTypeSwitch(this.props.index);
	}

	handleCreatorRemove(ev) {
		this.props.onCreatorRemove(this.props.index);
		ev && ev.stopPropagation();
	}

	handleCreatorAdd() {
		this.props.onCreatorAdd(this.props.creator);
	}

	handleModalOpen() {
		const { device, isEditing } = this.props;
		if(!device.shouldUseModalCreatorField) { return; }
		if(device.shouldUseEditMode && !isEditing) { return; }

		this.setState({ isModalVisible: true })
	}

	handleModalClose() {
		this.setState({ isModalVisible: false })
	}

	get icon() {
		return 'name' in this.props.creator ? '20/input-dual' : '20/input-single';
	}

	get isDual() {
		return 'lastName' in this.props.creator;
	}

	get creatorLabel() {
		const { creator, creatorTypes } = this.props;
		const creatorTypeDescription = creatorTypes.find(
				c => c.value == creator.creatorType
			) || { label: creator.creatorType };
		return creatorTypeDescription.label;
	}

	renderDual() {
		return (
			<React.Fragment>
				{ this.renderField('lastName', 'last name') }
				{ this.renderField('firstName', 'first name') }
			</React.Fragment>
		);
	}

	renderSingle() {
		return this.renderField('name', 'name');
	}

	renderEditable(name, input) {
		const props = {
			onClick: this.handleFieldClick.bind(this, name),
			onFocus: this.handleFieldFocus.bind(this, name),
			isActive: this.state.active === name,
			input
		};

		return <Editable { ...props } />
	}

	renderFormField(name, label, inModal = false) {
		const { isForm, creator } = this.props;
		const shouldUseEditable = !isForm && !inModal;
		const props = {
			tabIndex: 0,
			onClick: this.handleFieldClick.bind(this, name),
			onFocus: this.handleFieldFocus.bind(this, name),
			onCancel: this.handleCancel.bind(this),
			onCommit: this.handleEditableCommit.bind(this, name),
			placeholder: label,
			value: creator[name],
			'aria-label': label,
			className: shouldUseEditable ? 'editable-control' : 'form-control form-control-sm',
			isDisabled: this.props.readOnly,
			resize: (!inModal && name === 'lastName') ? 'horizontal' : null,
			ref: component => this.fieldComponents[name] = component
		};

		if(shouldUseEditable) {
			props['autoFocus'] = true;
			props['selectOnFocus'] = true;
		}

		return <Input { ...props } />
	}

	renderField(name, label, inModal = false) {
		const { isForm } = this.props;
		const shouldUseEditable = !isForm && !inModal;
		const formField = this.renderFormField(name, label, inModal);

		return shouldUseEditable ? this.renderEditable(name, formField) : formField;

	}

	renderCreatorTypeSelector() {
		const { creator, creatorTypes } = this.props;
		return <SelectInput
			className="form-control form-control-sm"
			inputComponent={ SelectInput }
			isActive={ this.state.active === 'creatorType' }
			onCancel={ this.handleCancel.bind(this) }
			onChange={ () => true }
			onCommit={ this.handleEditableCommit.bind(this, 'creatorType') }
			onClick={ this.handleFieldClick.bind(this, 'creatorType') }
			onFocus={ this.handleFieldFocus.bind(this, 'creatorType') }
			options={ creatorTypes }
			ref={ component => this.fieldComponents['creatorType'] = component }
			searchable={ false }
			tabIndex = { 0 }
			isDisabled = { this.props.readOnly }
			value={ creator.creatorType }
		/>
	}

	renderModal() {
		const { isModalVisible } = this.state;
		const content = (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					<div className="modal-header-left" />
					<div className="modal-header-center">
						<h4 className="modal-title truncate">
							{ this.creatorLabel }
						</h4>
					</div>
					<div className="modal-header-right">
						<Button
							className="btn-link"
							onClick={ this.handleModalClose.bind(this) }
						>
							Done
						</Button>
					</div>
				</div>
				<div className="modal-body">
					<ol className="metadata-list editing">
						<Field className="touch-separated">
							<label>
								Creator
							</label>
							{ this.renderCreatorTypeSelector() }
						</Field>
						{
							this.isDual ? (
								<React.Fragment>
									<Field>
										<label>
											Last Name
										</label>
										{ this.renderField('lastName', 'last name', true) }
									</Field>
									<Field>
										<label>
											First Name
										</label>
										{ this.renderField('firstName', 'first name', true) }
									</Field>
								</React.Fragment>
							) : (
								<Field>
									<label>
										Name
									</label>
									{ this.renderField('name', 'name', true) }
								</Field>
							)
						}
						<li className="metadata touch-separated has-btn">
							<Button onClick={ this.handleCreatorTypeSwitch.bind(this) }>
								Switch to { this.isDual ? 'Single' : 'Dual' } Field
							</Button>
						</li>
						<li className="metadata has-btn">
							<Button
								className="btn-delete"
								onClick={ this.handleCreatorRemove.bind(this) }
							>
								Delete { this.creatorLabel }
							</Button>
						</li>
					</ol>
				</div>
			</div>
		);

		return (
			<Modal
				isOpen={ isModalVisible }
				contentLabel="Edit Creator"
				className="modal-touch modal-centered"
				overlayClassName={ "modal-slide" }
				closeTimeoutMS={ 600 }
				onRequestClose={ this.handleModalClose.bind(this) }
			>
				{ content }
			</Modal>
		);
	}

	render() {
		const {
			creator,
			device,
			index,
			isEditing,
			isSingle,
			isVirtual,
			onDragStatusChange,
			onReorder,
			onReorderCancel,
			onReorderCommit,
			readOnly,
		} = this.props;
		const className = {
			'creators-entry': true,
			'creators-oneslot': 'name' in creator,
			'creators-twoslot': 'lastName' in creator,
			'creators-type-editing': this.state.isCreatorTypeActive,
			'creators-modal-trigger': device.shouldUseModalCreatorField,
			'metadata': true,
			'single': isSingle,
			'virtual': isVirtual
		};

		// raw formatted data for use in drag-n-drop indicator
		const raw = { ...creator, creatorType: this.creatorLabel, }

		return (
			<React.Fragment>
			{ isEditing && this.renderModal() }
			<Field
				className={ cx(this.props.className, className) }
				index={ index }
				isSortable={ !isSingle && !isVirtual && !readOnly }
				key={ creator.id }
				onClick={ this.handleModalOpen.bind(this) }
				onReorder={ onReorder }
				onReorderCancel={ onReorderCancel }
				onReorderCommit={ onReorderCommit }
				onDragStatusChange={ onDragStatusChange }
				raw={ raw }
				tabIndex = { isEditing ? 0 : null }
			>
				{ device.shouldUseModalCreatorField ?
					<div className="truncate">{ this.creatorLabel }</div> :
					this.renderCreatorTypeSelector()
				}
				<React.Fragment>
					{
						device.shouldUseModalCreatorField ? (
							<div className="truncate">
								{ isVirtual ? this.isDual ? 'last name, first name' : 'name' :
									formatCreator(creator)
								}
							</div>
						) : (
							this.isDual ? this.renderDual() : this.renderSingle()
						)
					}
					<Button
						className="btn-single-dual"
						onClick={ this.handleCreatorTypeSwitch.bind(this) }
					>
						<Icon type={ this.icon } width="20" height="20" />
					</Button>
					{
						this.props.isDeleteAllowed ? (
							<Button
								className="btn-minus"
								onClick={ this.handleCreatorRemove.bind(this) }
							>
								<Icon type={ '16/minus' } width="16" height="16" />
							</Button>
						) : (
							<Button className="btn-minus" disabled={ true }>
								<Icon type={ '16/minus' } width="16" height="16" />
							</Button>
						)
					}
					{
						this.props.isCreateAllowed ? (
							<Button
								className="btn-plus"
								onClick={ this.handleCreatorAdd.bind(this) }
							>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						) : (
							<Button className="btn-plus" disabled={ true }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						)
					}
				</React.Fragment>
			</Field>
			</React.Fragment>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		creator: PropTypes.object.isRequired,
		creatorTypes: PropTypes.array.isRequired,
		index: PropTypes.number.isRequired,
		isCreateAllowed: PropTypes.bool,
		isDeleteAllowed: PropTypes.bool,
		isForm: PropTypes.bool,
		isSingle: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		onCreatorAdd: PropTypes.func.isRequired,
		onCreatorRemove: PropTypes.func.isRequired,
		onCreatorTypeSwitch: PropTypes.func.isRequired,
		onDragStatusChange: PropTypes.func,
		onReorder: PropTypes.func,
		onReorderCancel: PropTypes.func,
		onReorderCommit: PropTypes.func,
		readOnly: PropTypes.bool,
	};
}

export default CreatorField;
