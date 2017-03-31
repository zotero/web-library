'use strict';

import React from 'react';
import { Editor, EditorState, RichUtils, convertFromHTML } from 'draft-js';

import { Toolbar, ToolGroup } from './ui/toolbars';
import Button from './ui/button';

export default class RichEditor extends React.Component {
	constructor(props) {
		super(props);
		let editorState = props.value ? convertFromHTML(props.value) : EditorState.createEmpty();
		this.state = {
			editorState: editorState
		};
	}

	componentWillReceiveProps(props) {
		let editorState = props.value ? convertFromHTML(props.value) : EditorState.createEmpty();
		this.state = {
			editorState: editorState
		};
	}

	onChangeHandler(editorState) {
		this.setState({editorState});
	}

	keyboardHandler(command) {
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if(newState) {
			this.onChangeHandler(newState);
			return 'handled';
		}
		return 'not-handled';
	}

	buttonHandler(command) {
		const newState = RichUtils.toggleInlineStyle(this.state.editorState, command);
		if(newState) {
			this.onChangeHandler(newState);
		}
	}

	render() {
		const currentStyle = this.state.editorState.getCurrentInlineStyle();
		return (
			<div className="rich-editor">
				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button 
								active={ currentStyle.has('BOLD') }
								onClick={ this.buttonHandler.bind(this, 'BOLD') }>
								B
							</Button>
							<Button 
								active={ currentStyle.has('ITALIC') }
								onClick={ this.buttonHandler.bind(this, 'ITALIC') }>
								I
							</Button>
							<Button 
								active={ currentStyle.has('UNDERLINE') }
								onClick={ this.buttonHandler.bind(this, 'UNDERLINE') }>
								U
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
				<div className="editor-container">
					<Editor 
						editorState={ this.state.editorState }
						onChange={ this.onChangeHandler.bind(this) }
						handleKeyCommand={ this.keyboardHandler.bind(this) }
					/>
				</div>
			</div>
		);
	}
}

RichEditor.propTypes = {
	value: React.PropTypes.string
};

RichEditor.defaultProps = {};