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
			<ol className="metadata-list horizontal">
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
							<li className={ cx('metadata', classNames) }>
								<div className='key'>
									<label>
										{ field.label }
									</label>
								</div>
								<div className='value'>
									{
										(() => {
											switch(field.key) {
												case 'notes':
													return null;
												case 'creators':
													return (
														<EditableCreators
															name={ field.key }
															creatorTypes = { this.props.creatorTypes }
															creatorTypesLoading = { this.props.creatorTypesLoading }
															value = { field.value || [] }
															onSave={ newValue => this.props.onSave(field.key, newValue) } />
													);
												case 'itemType':
													return (
														<Editable
															name={ field.key }
															options = { field.options || null }
															processing={ field.processing || false }
															value={ field.value || '' }
															editOnClick = { !field.readonly }
															onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
															onSave={ newValue => this.props.onSave(field.key, newValue) } 
														/>
													);
												default:
													return (
														<Editable
															name={ field.key }
															processing={ field.processing || false }
															value={ field.value || '' }
															editOnClick={ !field.readonly }
															onToggle={ this.onEditableToggleHandler.bind(this, field.key) }
															onSave={ newValue => this.props.onSave(field.key, newValue) }
														/>
													);
											}
										})()
									}
								</div>
							</li>
						];
					})
				}
			</ol>
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