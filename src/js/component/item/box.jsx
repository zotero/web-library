'use strict';

import React from 'react';
import cx from 'classnames';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';
import { itemProp } from '../../constants';

class ItemBox extends React.Component {
	render() {
		let Editable = this.props.components['Editable'];
		let EditableCreators = this.props.components['EditableCreators'];

		return (
			<dl className="dl-horizontal">
				{
					this.props.fields.map(field => {
						var classNames = [];

						if(this.props.hiddenFields.includes(field.key)) {
							return null;
						}

						if(!field.value || !field.value.length) {
							classNames.push('empty');
						}

						if(field.options && field.options.length) {
							classNames.push('select');
						}

						return [
							(<dt className={ cx(classNames) }>{ field.label }</dt>),
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
														onSave={ newValue => this.props.onSave(field, newValue) } />
												);
											default:
												return (
													<Editable 
														processing={ field.processing || false }
														value={ field.value || '' }
														editOnClick = { !field.readonly }
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