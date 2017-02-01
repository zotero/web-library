'use strict';

import React from 'react';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';
import { itemProp } from '../constants';

class ItemDetails extends React.Component {
	render() {
		let Tabset = this.props.components['Tabset'];
		let Tab = this.props.components['Tab'];
		let ItemBox = this.props.components['ItemBox'];
		return (
			<section className={ `item-details ${this.props.active ? 'active' : ''}` }>
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
									<ItemBox
										hiddenFields={ [ 'abstractNote' ] }
										fields={ this.props.fields }
										item={ this.props.item } 
									/>
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