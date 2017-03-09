'use strict';

import React from 'react';
import cx from 'classnames';

import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';
import { itemProp } from '../constants';

class ItemDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tab: 'info'
		};
	}

	render() {
		let Panel = this.props.components['Panel'];
		let Tabs = this.props.components['Tabs'];
		let Tab = this.props.components['Tab'];
		let ItemBox = this.props.components['ItemBox'];

		return (
			<section className={ `item details ${this.props.active ? 'active' : ''}` }>
				<Panel>
					<div>
						<h4 className="offscreen">
							{ this.props.title }
						</h4>
						<Tabs>
							<Tab 
							isActive={ this.state.tab === 'info' }
							onActivate={ () => this.setState({ tab: 'info' }) }
							>
								Info
							</Tab>
							<Tab 
							isActive={ this.state.tab === 'notes' }
							onActivate={ () => this.setState({ tab: 'notes' }) }
							>
								Notes
							</Tab>
							<Tab 
							isActive={ this.state.tab === 'tag' }
							onActivate={ () => this.setState({ tab: 'tag' }) }
							>
								Tag
							</Tab>
							<Tab 
							isActive={ this.state.tab === 'attachments' }
							onActivate={ () => this.setState({ tab: 'attachments' }) }
							>
								Attachments
							</Tab>
							<Tab 
							isActive={ this.state.tab === 'related' }
							onActivate={ () => this.setState({ tab: 'related' }) }
							>
								Related
							</Tab>
						</Tabs>
					</div>
					<Panel className={ cx({ 
							'tab-pane': true,
							'info': true,
							'active': this.state.tab === 'info'
						}) }>
						<div className="toolbar hidden-sm-down hidden-lg-up">
							<div className="toolbar-right"><button className="btn">Edit</button></div>
						</div>
						<div className="row">
							<div className="col">
								<h5 className="h1 item-title">Item Title</h5>
								<ItemBox
									hiddenFields={ [ 'abstractNote' ] }
									fields={ this.props.fields }
									item={ this.props.item }
								/>
							</div>
							<div className="col">
								<section className="abstract">
									<h6 className="h2 abstract-heading">Abstract</h6>
									<div>
										{ this.props.item.data.abstractNote }
									</div>
								</section>
							</div>
						</div>
					</Panel>
					<Panel className={ cx({ 
							'tab-pane': true,
							'notes': true,
							'active': this.state.tab === 'notes'
						}) }>
						<h5 className="h2 tab-pane-heading">Notes</h5>
						<span>Notes tab content goes here</span>
					</Panel>
					<Panel className={ cx({ 
							'tab-pane': true,
							'tags': true,
							'active': this.state.tab === 'tags'
						}) }>
						<h5 className="h2 tab-pane-heading">Tags</h5>
						<span>Tag tab content goes here</span>
					</Panel>
					<Panel className={ cx({ 
							'tab-pane': true,
							'attachments': true,
							'active': this.state.tab === 'attachments'
						}) }>
						<h5 className="h2 tab-pane-heading">Attachments</h5>
						<span>Attachments tab content goes here</span>
					</Panel>
					<Panel className={ cx({ 
							'tab-pane': true,
							'related': true,
							'active': this.state.tab === 'related'
						}) }>
						<h5 className="h2 tab-pane-heading">Related</h5>
						<span>Related tab content goes here</span>
					</Panel>
				</Panel>
			</section>
		);
	}
}

ItemDetails.defaultProps = {
	item: {
		title: '',
		data: {}
	},
	fields: [],
	active: false
};

ItemDetails.propTypes = {
	fields: React.PropTypes.array,
	active: React.PropTypes.bool,
	item: itemProp
};

export default InjectableComponentsEnhance(ItemDetails);