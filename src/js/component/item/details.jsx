'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const InjectableComponentsEnhance = require('../../enhancers/injectable-components-enhancer');
const { itemProp } = require('../../constants/item');

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
		let Tab = this.props.components['Tab'];
		let Tabs = this.props.components['Tabs'];
		let NoteEditor = this.props.components['NoteEditor'];

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
						<div className="row">
							<div className="col">
								<h5 className="h1 item-title">Item Title</h5>
								<ItemBox
									item={ this.props.item }
									hiddenFields={ [ 'abstractNote' ] }
								/>
							</div>
							<div className="col">
								<section className="abstract">
									<h6 className="h2 abstract-heading">Abstract</h6>
									<div>
										{ this.props.item.abstractNote }
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
						<NoteEditor
							item={ this.props.item }
							notes={ this.props.childItems.filter(i => i.itemType === 'note') }
							onChange={ this.props.onNoteChange }
						/>
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
	item: {},
	active: false
};

ItemDetails.propTypes = {
	active: PropTypes.bool,
	item: itemProp,
	childItems: PropTypes.array,
	onNoteChange: PropTypes.func.isRequired
};

module.exports = InjectableComponentsEnhance(ItemDetails);