'use strict';

const React = require('react');
const cx = require('classnames');
const ItemBoxContainer = require('../../../../container/item-box');

class InfoTab extends React.PureComponent {
	render() {
		return (
			<div className={ cx({
				'tab-pane': true,
				'info': true,
				'active': this.props.isActive
			}) }>
				<div className="row">
					<div className="col">
						<h5 className="h1 item-title">Item Title</h5>
						<ItemBoxContainer
							item={ this.props.item }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					<div className="col">
						<section className="abstract">
							<h6 className="h2 abstract-heading">Abstract</h6>
							<div className="abstract-body">
								{ this.props.item.abstractNote }
							</div>
						</section>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = InfoTab;
