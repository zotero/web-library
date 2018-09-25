'use strict';

const React = require('react');
const cx = require('classnames');
const ItemBoxContainer = require('../../../../container/item-box');
const EditToggleButton = require('../../../edit-toggle-button');

class InfoTabPane extends React.PureComponent {
	render() {
		const { isActive, isEditing, item } = this.props;

		return (
			<div className={ cx({
				'tab-pane': true,
				'info': true,
				'active': isActive
			}) }>
				<div className="row">
					<div className="col">
						{ !isEditing && (
								<h5 className="h1 item-title">
									{ item.title }
								</h5>
							)
						}
						<EditToggleButton className="hidden-mouse hidden-touch-md-down" />
						<ItemBoxContainer
							item={ item }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					<div className="col">
						<section className="abstract">
							<h6 className="h2 abstract-heading">Abstract</h6>
							<div className="abstract-body">
								{ item.abstractNote }
							</div>
						</section>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = InfoTabPane;
