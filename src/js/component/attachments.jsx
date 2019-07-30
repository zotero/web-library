'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Icon from './ui/icon';
import Button from './ui/button';
import withFocusManager from '../enhancers/with-focus-manager';
import Spinner from './ui/spinner';
import { getFileData } from '../common/event';


class Attachments extends React.PureComponent {
	state = {
		isAddingAttachment: false,
		fileData: null,
	}

	handleClose() {
		this.setState({
			isAddingAttachment: false
		});
	}

	handleAddAttachment() {
		this.setState({
			isAddingAttachment: true
		});
	}

	handleFileSelect = async ev => {
		const fileData = await getFileData(ev.currentTarget.files[0]);
		this.setState({ fileData });
	}

	handleFileUpload() {
		this.props.onAddAttachment(this.state.fileData);
	}

	handleDelete(attachment) {
		this.props.onDeleteAttachment(attachment);
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowDown') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			onFocusPrev(ev);
		}
	}

	render() {
		const { attachments, isReadOnly, onFocusNext, onFocusPrev, onFocus,
			onBlur, registerFocusRoot, uploads } = this.props;
		return (
			<div
				className="details-list attachments"
				key="attachments"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ ref => registerFocusRoot(ref) }
				tabIndex={ 0 }
			>
				<nav>
					<ul className="nav list">
						{
							attachments.map(attachment => {
								const isStillUploading = uploads.includes(attachment.key);
								return (
									<li
										className={ cx('item', {'selected': this.state.selected == attachment.key }) }
										key={ attachment.key }
									>
										<Icon type={ '16/item-types/attachment' } width="16" height="16" />
										{
											!isStillUploading && attachment[Symbol.for('attachmentUrl')] ? (
												<a
													href={ attachment[Symbol.for('attachmentUrl')] }
													onKeyDown={ this.handleKeyDown }
													tabIndex={ -2 }
												>
													{ attachment.title || attachment.filename }
												</a>
											) : (
												<span
													onKeyDown={ this.handleKeyDown }
													tabIndex={ -2 }
												>
													{ attachment.title || attachment.filename }
													{ isStillUploading && <Spinner className="small" /> }
												</span>
											)
										}
										{ !isReadOnly && (
											<Button
												icon
												onClick={ this.handleDelete.bind(this, attachment) }
												tabIndex={ -1 }
											>
												<Icon type={ '16/trash' } width="16" height="16" />
											</Button>
										)}
									</li>
								);
							})
						}
						{
							this.state.isAddingAttachment && (
								<li>
									<input onChange={ this.handleFileSelect } type="file" />
									<Button
										disabled={ !this.state.fileData }
										onClick={ this.handleFileUpload.bind(this) }
									>
										Upload
									</Button>
								</li>
							)
						}
					</ul>
				</nav>

				{ !isReadOnly && (
					<Toolbar>
						<div className="toolbar-left">
							<ToolGroup>
								<Button
									icon
									onClick={ this.handleAddAttachment.bind(this) }
									onKeyDown={ this.handleKeyDown }
									tabIndex={ -2 }
								>
									<Icon type={ '16/plus' } width="16" height="16" />
								</Button>
							</ToolGroup>
						</div>
					</Toolbar>
				) }
			</div>
		);
	}
}

Attachments.propTypes = {

};

Attachments.defaultProps = {
	attachments: [],
};

export default withFocusManager(Attachments);
