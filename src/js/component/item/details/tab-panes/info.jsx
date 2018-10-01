'use strict';

const React = require('react');
const cx = require('classnames');
const ItemBoxContainer = require('../../../../container/item-box');
const EditToggleButton = require('../../../edit-toggle-button');
const Abstract = require('../../abstract');

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
							{ ...this.props }
							hiddenFields={ [ 'abstractNote' ] }
						/>
					</div>
					<div className="col">
						<section className={ cx('abstract', !item.abstractNote && 'empty-abstract') }>
							<h6 className="h2 abstract-heading">
								Abstract
							</h6>
							<div className="abstract-body">
								<Abstract { ...this.props } />
							</div>
						</section>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = InfoTabPane;
