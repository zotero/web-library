'use strict';

import React from 'react';
import cx from 'classnames';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';
import { itemProp } from '../../constants';

class ItemBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditingMap: {}
		};
	}

	onEditableToggleHandler(key, isEditing) {
		this.setState({
			isEditingMap: {
				...this.state.isEditingMap,
				[key]: isEditing
			}
		});
	}

	render() {
		let Editable = this.props.components['Editable'];
		let EditableCreators = this.props.components['EditableCreators'];

		return (
			<dl className="dl-horizontal">
				{
					this.props.fields.map(field => {
						if(this.props.hiddenFields.includes(field.key)) {
							return null;
						}

						const classNames = {
							'empty': !field.value || !field.value.length,
							'select': field.options && Array.isArray(field.options),
							'editing': field.key in this.state.isEditingMap && this.state.isEditingMap[field.key]
						};

						return [
							(<dt className={ cx(classNames) }>
								<label>
									{ field.label }
								</label>
							</dt>),
							(<dd className={ cx(classNames) }>
								{
									(() => {
										switch(field.key) {
											case 'notes':
												return null;
											case 'creators':
												return (
													<EditableCreators
														creatorTypes = { this.props.creatorTypes }
														creatorTypesLoading = { this.props.creatorTypesLoading }
														value = { field.value || [] }
														onSave={ newValue => this.props.onSave(field, newValue) } />
												);
											case 'itemType':
												return (
													<Editable
														options = { field.options || null }
														processing={ field.processing || false }
														value={ field.value || '' }
														editOnClick = { !field.readonly }
														onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
														onSave={ newValue => this.props.onSave(field, newValue) } />
												);
											default:
												return (
													<Editable
														processing={ field.processing || false }
														value={ field.value || '' }
														editOnClick={ !field.readonly }
														onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
														onSave={ newValue => this.props.onSave(field, newValue) }
													>
														{
															(() => {
																if(field.key === 'DOI') {
																	return <a rel='nofollow' href={ 'http://dx.doi.org/' + field.value }>{ field.value }</a>;
																} else if(field.key === 'url') {
																	return <a rel='nofollow' href={ field.value }>{ field.value }</a>;
																} else {
																	return field.value;
																}
															})()
														}
													</Editable>
												);
										}
									})()
								}
							</dd>)
						];
					})
				}
			</dl>
		);
	}
}

ItemBox.defaultProps = {
	fields: [],
	hiddenFields: [],
	onSave: v => Promise.resolve(v)
};

ItemBox.propTypes = {
	creatorTypes: React.PropTypes.array,
	creatorTypesLoading: React.PropTypes.bool,
	fields: React.PropTypes.array,
	hiddenFields: React.PropTypes.array,
	item: itemProp,
	onSave: React.PropTypes.func
};

export default InjectableComponentsEnhance(ItemBox);