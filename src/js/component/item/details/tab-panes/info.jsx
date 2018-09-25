'use strict';

const React = require('react');
const cx = require('classnames');
const Button = require('../../../ui/button');
const ItemBoxContainer = require('../../../../container/item-box');

class InfoTabPane extends React.PureComponent {
	render() {
		const { isEditing, onEditModeToggle } = this.props;
		return (
			<div className={ cx({
				'tab-pane': true,
				'info': true,
				'active': this.props.isActive
			}) }>
				<div className="row">
					<div className="col">
						{ !this.props.isEditing && (
								<h5 className="h1 item-title">
									{ this.props.item.title }
								</h5>
							)
						}
						<Button
							className="hidden-mouse hidden-touch-md-down"
							onClick={ () => onEditModeToggle(!isEditing) }
						>
							{ isEditing ? "Done" : "Display Empty Fields" }
						</Button>
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

module.exports = InfoTabPane;
