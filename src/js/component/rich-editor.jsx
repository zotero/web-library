'use strict';

const React = require('react');
const tinymce = require('tinymce');
require('tinymce/themes/modern');
const TinyMCE = require('react-tinymce');
const PropTypes = require('prop-types');
const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Button = require('./ui/button');

class RichEditor extends React.Component {
	componentWillMount() {
		window.tinymce = tinymce;
	}

	handleTinymceSetup(tinymce) {
		this.tinymce = tinymce;
	}

	onChangeHandler() {
		this.forceUpdate();
	}

	buttonHandler(command) {
		this.tinymce ? this.tinymce.editorCommands.execCommand(command) : null;
	}

	isEditorCommandState(command) {
		return this.tinymce && this.tinymce.editorCommands.queryCommandState(command);
	}

	render() {
		return (
			<div className="rich-editor">
				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button 
								className="btn-icon"
								active={ this.isEditorCommandState('BOLD') }
								onClick={ this.buttonHandler.bind(this, 'BOLD') }>
								B
							</Button>
							<Button 
								className="btn-icon"
								active={ this.isEditorCommandState('ITALIC') }
								onClick={ this.buttonHandler.bind(this, 'ITALIC') }>
								I
							</Button>
							<Button 
								className="btn-icon"
								active={ this.isEditorCommandState('UNDERLINE') }
								onClick={ this.buttonHandler.bind(this, 'UNDERLINE') }>
								U
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
				<div className="editor-container">
					<TinyMCE
						content={ this.props.value }
						config={{
							skin_url: '/static/other/lightgray',
							branding: false,
							setup: this.handleTinymceSetup.bind(this),
							toolbar: false,
							menubar: false,
							statusbar: false
						}}
						onChange={ this.onChangeHandler.bind(this) }
						/>
				</div>
			</div>
		);
	}
}

RichEditor.propTypes = {
	value: PropTypes.string
};

RichEditor.defaultProps = {};

module.exports = RichEditor;