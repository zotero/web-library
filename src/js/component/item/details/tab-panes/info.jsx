'use strict';

const React = require('react');
const cx = require('classnames');
const ItemBox = require('../../box');
const Abstract = require('../../abstract');
const Spinner = require('../../../ui/spinner');

class InfoTabPane extends React.PureComponent {
	render() {
		const { isActive, isEditing, isLoadingMeta, item } = this.props;

		return (
			<div className={ cx({
				'tab-pane': true,
				'info': true,
				'active': isActive,
				'loading': isLoadingMeta
			}) }>
				{
					isLoadingMeta ? <Spinner /> : (
						<div className="row">
							<div className="col">
								{ !isEditing && (
										<h5 className="h1 item-title">
											{ item.title }
										</h5>
									)
								}
								<ItemBox
									{ ...this.props }
									hiddenFields={ [ 'abstractNote' ] }
								/>
							</div>
							<div className="col">
								<section className={ cx({
									'empty-abstract': !item.abstractNote,
									abstract: true,
									editing: isEditing,
								}) }>
									<h6 className="h2 abstract-heading">
										Abstract
									</h6>
									<div className="abstract-body">
										<Abstract { ...this.props } />
									</div>
								</section>
							</div>
						</div>
					)
				}
			</div>
		);
	}
}

module.exports = InfoTabPane;
