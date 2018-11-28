'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

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

	handleFileSelect(ev) {
		let fileName = ev.target.files[0].name;
		let mtime = ev.target.files[0].lastModified;
		let contentType = ev.target.files[0].type;
		let reader = new FileReader();
		reader.onload = ev => {
			let file = ev.target.result;
			let fileData = { file, fileName, mtime, contentType };
			this.setState({ fileData });
		};
		reader.readAsArrayBuffer(ev.target.files[0]);
	}

	handleFileUpload() {
		this.props.onAddAttachment(this.state.fileData);
	}

	handleDelete(attachment) {
		this.props.onDeleteAttachment(attachment);
	}

	render() {
		return (
			<div className="details-list attachments" key="attachments">
				<nav>
					<ul className="nav list">
						{
							this.props.attachments.map(attachment => {
								return (
									<li
										className={ cx('item', {'selected': this.state.selected == attachment.key }) }
										key={ attachment.key }
									>
										<Icon type={ '16/item-types/attachment' } width="16" height="16" />
										{
											attachment[Symbol.for('attachmentUrl')] ? (
												<a href={ attachment[Symbol.for('attachmentUrl')] }>
													{ attachment.title || attachment.filename }
												</a>
											) : (
												<span>
													{ attachment.title || attachment.filename }
												</span>
											)
										}
										<Button onClick={ this.handleDelete.bind(this, attachment) }>
											<Icon type={ '16/trash' } width="16" height="16" />
										</Button>
									</li>
								);
							})
						}
						{
							this.state.isAddingAttachment && (
								<li>
									<input onChange={ this.handleFileSelect.bind(this) } type="file" />
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

				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button onClick={ this.handleAddAttachment.bind(this) }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</div>
		);
	}
}

Attachments.propTypes = {

};

Attachments.defaultProps = {
	attachments: [],
	attachmentViewUrls: {}
};

module.exports = Attachments;
