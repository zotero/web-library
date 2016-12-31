'use strict';

import React from 'react';

import Item from './item.jsx';

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

					{/* Future tabs component */}
					<nav>
						{/* Props: justified, compact */}
						<ul className="tabs compact">
							<li className={ this.state.active == 'info' ? 'active' : '' }>
								<a href="#" onClick={ ev => this.setActiveTab('info', ev) }>Info</a>
							</li>
							<li className={ this.state.active == 'notes' ? 'active' : '' }>
								<a href="#" onClick={ ev => this.setActiveTab('notes', ev) }>Notes</a>
							</li>
							<li className={ this.state.active == 'tags' ? 'active' : '' }>
								<a href="#" onClick={ ev => this.setActiveTab('tags', ev) }>Tags</a>
							</li>
							<li className={ this.state.active == 'attachments' ? 'active' : '' }>
								<a href="#" onClick={ ev => this.setActiveTab('attachments', ev) }>Attachments</a>
							</li>
							<li className={ this.state.active == 'related' ? 'active' : '' }>
								<a href="#" onClick={ ev => this.setActiveTab('related', ev) }>Related</a>
							</li>
						</ul>
					</nav>
				</header>
				<div className="panel-body">
					<div className="tab-content">
						<div className={ `tab-pane ${this.state.active == 'info' ? 'active' : ''}` }>
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
						</div>
					</div>
					<div className="tab-content">
						<div className={ `tab-pane ${this.state.active == 'notes' ? 'active' : ''}` }>
							NOTES
						</div>
					</div>
					<div className="tab-content">
						<div className={ `tab-pane ${this.state.active == 'tags' ? 'active' : ''}` }>
							TAGS
						</div>
					</div>
					<div className="tab-content">
						<div className={ `tab-pane ${this.state.active == 'attachments' ? 'active' : ''}` }>
							ATTACHMENTS
						</div>
					</div>
					<div className="tab-content">
						<div className={ `tab-pane ${this.state.active == 'related' ? 'active' : ''}` }>
							RELATED
						</div>
					</div>
				</div>
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