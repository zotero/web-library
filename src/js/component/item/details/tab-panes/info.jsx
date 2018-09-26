'use strict';

const React = require('react');
const cx = require('classnames');
const ItemBoxContainer = require('../../../../container/item-box');
const EditToggleButton = require('../../../edit-toggle-button');
const Editable = require('../../../editable');
const TextAreaInput = require('../../../form/text-area');
const withDevice = require('../../../../enhancers/with-device');

class InfoTabPane extends React.PureComponent {
	state = {
		isActive: false
	}

	handleCommit(newValue) {
		this.props.onSave('abstractNote', newValue);
		this.setState({ isActive: false });
	}

	render() {
		const { isActive, isEditing, item, device, pendingChanges } = this.props;
		const placeholder = !device.shouldUseEditMode || (device.shouldUseEditMode && isEditing) ?
			'Add abstract…' : '';

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
						<section className="abstract">
							<h6 className={ cx('h2 abstract-heading', !item.abstractNote && 'empty') }>
								Abstract
							</h6>
							<div className="abstract-body">
								<Editable
									autoFocus
									resize='vertical'
									isActive={ this.state.isActive }
									onClick={ () => this.setState({ isActive: true }) }
									onCommit={ this.handleCommit.bind(this) }
									onCancel={ () => this.setState({ isActive: false }) }
									isBusy={ pendingChanges.some(({ patch }) => 'abstractNote' in patch) }
									inputComponent={ TextAreaInput }
									value={ item.abstractNote }
									placeholder={ placeholder }
								/>
							</div>
						</section>
					</div>
				</div>
			</div>
		);
	}
}

module.exports = withDevice(InfoTabPane);
