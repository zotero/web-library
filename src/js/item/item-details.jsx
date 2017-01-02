'use strict';

import React from 'react';
import Item from './item.jsx';
import Tabset from '../ui/tabset.jsx';
import Tab from '../ui/tab.jsx';

export default class ItemDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active: 'info'
		};
	}
	setActiveTab(active, ev) {
		ev.preventDefault();
		this.setState({
			active
		});
	}

	render() {
		var fieldsToSkip = [ 'abstractNote' ];
		return (
			<section className="panel">
				<header className="panel-header">
					<h4 className="offscreen">
						{ this.props.item.data.title }
					</h4>
				</header>
				<Tabset>
					<Tab title="Info">
						<div className="toolbar hidden-sm-down hidden-lg-up">
							<div className="toolbar-right"><button className="btn">Edit</button></div>
						</div>
						<div className="row">
							<div className="col">
								{/* Description list */}
								<dl className="dl-horizontal">
									{
										this.props.fields.map(field => {
											var className;
											if(!field.visible || fieldsToSkip.includes(field.key)) {
												return null;
											}

											if(!field.value || !field.value.length) {
												className = 'empty';
											}

											switch(field.type) {
												case this.constructor.fieldTypes.EDITABLE:
												case this.constructor.fieldTypes.READONLY:
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
												case this.constructor.fieldTypes.CREATORS:
													return null;
											}
										})
									}
								</dl>
							</div>
							<div className="col">
								<section className="abstract">
									<div className="separator hidden-md-down" role="separator"></div>
									<h5>Abstract</h5>
									<div>
										{ this.props.item.data.abstractNote }
									</div>
								</section>
							</div>
						</div>
					</Tab>
					<Tab title="Notes">
						Notes tab content goes here
					</Tab>
					<Tab title="Tag">
						Tag tab content goes here
					</Tab>
					<Tab title="Attachments">
						Attachments tab content goes here
					</Tab>
					<Tab title="Related">
						Related tab content goes here
					</Tab>
				</Tabset>
			</section>
		);
	}

	static get fieldTypes() {
		return {
			EDITABLE: 'EDITABLE',
			READONLY: 'READONLY',
			CREATORS: 'CREATORS'
		};
	}
}

ItemDetails.propTypes = {

};

ItemDetails.defaultProps = {
	item: {
		title: '',
		data: {}
	},
	fields: []
};

ItemDetails.propTypes.item = Item.propTypes.item;