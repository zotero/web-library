'use strict';

import React from 'react';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';
import { fieldTypes, itemProp } from '../../constants';

class ItemBox extends React.Component {
	render() {
		return (
			<dl className="dl-horizontal">
					{
						this.props.fields.map(field => {
							var className;
							if(!field.visible || this.props.hiddenFields.includes(field.key)) {
								return null;
							}

							if(!field.value || !field.value.length) {
								className = 'empty';
							}

							switch(field.type) {
								case fieldTypes.EDITABLE:
								case fieldTypes.READONLY:
									return [
										(<dt className={ className }>{ field.label }</dt>),
										(<dd className={ className }>
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
										</dd>)
									];
								case fieldTypes.CREATORS:
									return null;
							}
						})
					}
			</dl>
		);
	}
}

ItemBox.defaultProps = {
	item: {
		title: '',
		data: {}
	},
	fields: [],
	hiddenFields: []
};

ItemBox.propTypes = {
	fields: React.PropTypes.array,
	hiddenFields: React.PropTypes.array,
	item: itemProp
};

export default InjectableComponentsEnhance(ItemBox);