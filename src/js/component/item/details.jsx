'use strict';

import React from 'react';
import cx from 'classnames';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';
import { itemProp } from '../../constants';

class ItemDetails extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tab: 'info'
		};
	}

	render() {
		let ItemBox = this.props.components['ItemBox'];
		let Panel = this.props.components['Panel'];
		let Spinner = this.props.components['Spinner'];
		let Tab = this.props.components['Tab'];
		let Tabs = this.props.components['Tabs'];
		let Toolbar = this.props.components['Toolbar'];

		return (
			<section className={ `item details ${this.props.active ? 'active' : ''}` }>
				<Panel>
					<header>
						<h4 className="offscreen">
							{ this.props.title }
						</h4>
						<Tabs compact>
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
					</header>
					<div className={ cx({
							'tab-pane': true,
							'info': true,
							'active': this.state.tab === 'info'
						}) }>
						<Toolbar className="hidden-sm-down hidden-lg-up">
							<div className="toolbar-right">
								<button className="btn btn-primary">
									Edit
								</button>
							</div>
						</Toolbar>
						<div className="row">
							<div className="col">
								<h5 className="h1 item-title">Item Title</h5>
								<div className="hidden-sm-up">
									{ this.props.processing ? <Spinner /> : null }
								</div>
								<ItemBox
									item={ this.props.item }
									hiddenFields={ [ 'abstractNote' ] }
								/>
							</div>
							<div className="col">
								<section className="abstract">
									<h6 className="h2 abstract-heading">Abstract</h6>
									<div>
										{ this.props.item.get('abstractNote') }
									</div>
								</section>
							</div>
						</div>
					</div>
					<div className={ cx({
							'tab-pane': true,
							'notes': true,
							'active': this.state.tab === 'notes'
						}) }>
						<h5 className="h2 tab-pane-heading">Notes</h5>
						<span>Notes tab content goes here</span>
					</div>
					<div className={ cx({
							'tab-pane': true,
							'tags': true,
							'active': this.state.tab === 'tags'
						}) }>
						<h5 className="h2 tab-pane-heading">Tags</h5>
						<span>Tag tab content goes here</span>
					</div>
					<div className={ cx({
							'tab-pane': true,
							'attachments': true,
							'active': this.state.tab === 'attachments'
						}) }>
						<h5 className="h2 tab-pane-heading">Attachments</h5>
						<span>Attachments tab content goes here</span>
					</div>
					<div className={ cx({
							'tab-pane': true,
							'related': true,
							'active': this.state.tab === 'related'
						}) }>
						<h5 className="h2 tab-pane-heading">Related</h5>
						<span>Related tab content goes here</span>
					</div>
				</Panel>
			</section>
		);
	}
}

ItemDetails.defaultProps = {
	item: {
		get: () => ''
	},
	active: false,
	processing: false
};

ItemDetails.propTypes = {
	active: React.PropTypes.bool,
	item: itemProp,
	processing: React.PropTypes.bool
};

export default InjectableComponentsEnhance(ItemDetails);