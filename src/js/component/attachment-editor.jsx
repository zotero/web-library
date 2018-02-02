'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class AttachmentEditor extends React.Component {
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

	render() {
		return (
			<div key="attachment-editor" className="attachment-editor">
				<nav>
					<ul className="nav list">
						{
							this.props.attachments.map(attachment => {
								return (
									<li 
										className={ cx('item', {'selected': this.state.selected == attachment.key }) }
										key={ attachment.key }
									>
										<Icon type={ '16/paperclip' } width="16" height="16" />
										<a>
											{ attachment.filename }
										</a>
										<Icon type={ '16/trash' } width="16" height="16" />
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

AttachmentEditor.propTypes = {
	
};

AttachmentEditor.defaultProps = {
	attachments: []
};

module.exports = AttachmentEditor;