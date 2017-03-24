'use strict';

import React from 'react';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';
import { itemProp } from '../../constants';

class ItemBox extends React.Component {
	render() {
		let Editable = this.props.components['Editable'];
		return (
			<dl className="dl-horizontal">
				{
					this.props.fields.map(field => {
						var className;

						if(this.props.hiddenFields.includes(field.key)) {
							return null;
						}

						if(!field.value || !field.value.length) {
							className = 'empty';
						}

						return [
							(<dt className={ className }>{ field.label }</dt>),
							(<dd className={ className }>
								{
									(() => {
										switch(field.key) {
											case 'notes':
												return null;
											case 'creators':
												return null;
											default:
												return (
													<Editable 
														processing={ field.processing || false }
														value={ field.value }
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
	fields: React.PropTypes.array,
	hiddenFields: React.PropTypes.array,
	item: itemProp,
	onSave: React.PropTypes.func
};

export default InjectableComponentsEnhance(ItemBox);