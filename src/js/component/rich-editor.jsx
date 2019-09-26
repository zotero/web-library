/* eslint-disable react/no-deprecated */
'use strict';

import { Editor } from '@tinymce/tinymce-react';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Button from './ui/button';
import Icon from './ui/icon';
import { Toolbar, ToolGroup } from './ui/toolbars';
import ColorPicker from './ui/color-picker';
import Spinner from './ui/spinner';

const formatBlocks = [
	{ value: 'p', Tag: 'p', label: 'Paragraph' },
	{ value: 'h1', Tag: 'h1', label: 'Heading 1' },
	{ value: 'h2', Tag: 'h2', label: 'Heading 2' },
	{ value: 'h3', Tag: 'h3', label: 'Heading 3' },
	{ value: 'h4', Tag: 'h4', label: 'Heading 4' },
	{ value: 'h5', Tag: 'h5', label: 'Heading 5' },
	{ value: 'h6', Tag: 'h6', label: 'Heading 6' },
	{ value: 'pre', Tag: 'pre', label: 'Preformatted' },
];

const dropdowns = {
	forecolor: false,
	hilitecolor: false,
	formatblock: false,
};

const validElements = '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang],'
	+ 'a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class],'
	+ 'strong/b,'
	+ 'em/i,'
	+ 'strike,'
	+ 'u,'
	+ '#p,'
	+ '-ol[type|compact],'
	+ '-ul[type|compact],'
	+ '-li,'
	+ 'br,'
	+ 'img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],'
	+ '-sub,-sup,'
	+ '-blockquote[cite],'
	+ '-table[border=0|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],'
	+ '-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],'
	+ 'tbody,thead,tfoot,'
	+ '#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],'
	+ '#th[colspan|rowspan|width|height|align|valign|scope],'
	+ 'caption,'
	+ '-div,'
	+ '-span,'
	+ '-code,'
	+ '-pre,'
	+ 'address,'
	+ '-h1,-h2,-h3,-h4,-h5,-h6,'
	+ 'hr[size|noshade],'
	+ '-font[face|size|color],'
	+ 'dd,dl,dt,'
	+ 'cite,'
	+ 'abbr,'
	+ 'acronym,'
	+ 'del[datetime|cite],ins[datetime|cite],'
	+ 'bdo,'
	+ 'col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],'
	+ 'dfn,'
	+ 'kbd,'
	+ 'label[for],'
	+ 'legend,'
	+ 'q[cite],'
	+ 'samp,'
	+ 'var,';

const invalidElements = 'iframe';

//@NOTE: exposes focus() method
class RichEditor extends React.PureComponent {
	state = {
		hilitecolor: null,
		content: this.props.value,
		forecolor: null,
		dropdowns,
	};

	handleEditorInit = (ev, editor) => {
		this.editor = editor;
		if(this.wantsFocus) {
			this.editor.focus();
			this.wantsFocus = false;
		}
	}

	focus = () => {
		if(this.editor) {
			this.editor.focus();
		} else {
			this.wantsFocus = true;
		}
	}

	async componentDidMount() {
		const { isTinymceFetched, isTinymceFetching, sourceFile } = this.props;
		if(!isTinymceFetched && !isTinymceFetching) {
			sourceFile('tinymce');
		}
	}

	handleEditorChange = newContent => {
		const { onChange } = this.props;
		const { content } = this.state;

		// force re-render so that formatting buttons are correctly highlighted
		this.forceUpdate();

		if(newContent === content) {
			return;
		}
		this.setState({ content: newContent });

		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			onChange(newContent);
		}, 500);
	}

	handleButtonClick = ev => {
		if(!this.editor) { return; }
		const { command, value } = ev.currentTarget.dataset;

		if(command === 'forecolor' || command === 'hilitecolor') {
			this.setColor(command, this.state[command]);
		} else {
			this.editor.editorCommands.execCommand(command, undefined, value);
		}
	}

	handleFocus = () => {
		this.setState({ dropdowns });
	}

	handleForeColorPicked = color => {
		this.setState({ forecolor: color });
		this.setColor('forecolor', color);
	}

	handleHiLiteColorPicked = color => {
		this.setState({ hilitecolor: color });
		this.setColor('hilitecolor', color);
	}

	handleDropdownToggle = ev => {
		const dropdown = 'closest' in ev.currentTarget && ev.currentTarget.closest('[data-dropdown]');
		if(dropdown) {
			const dropdownName = ev.currentTarget.closest('[data-dropdown]').dataset.dropdown;
			this.setState({ dropdowns: {
				...dropdowns,
				[dropdownName]: !this.state.dropdowns[dropdownName]
			}});
		} else {
			this.setState({ dropdowns });
		}
	}

	handleDropdownKeyDown = ev => {
		if(ev.key === 'Escape') {
			this.setState({ dropdowns });
			ev.stopPropagation();
		}
	}

	setColor = (which, color) => {
		if(!color) {
			this.editor.editorCommands.execCommand('mceRemoveTextcolor', which);
		} else {
			this.editor.editorCommands.execCommand(which, undefined, color);
		}

	}

	isEditorCommandState(command) {
		return this.editor && this.editor.editorCommands.queryCommandState(command);
	}

	queryFormatBlock() {
		const formatBlock = this.editor && this.editor.editorCommands.queryCommandValue('formatblock') || 'p';
		return (formatBlocks.find(fb => fb.value === formatBlock) || {}).label;
	}

	refreshEditor = () => this.forceUpdate();

	renderEditor() {
		if(process.env.NODE_ENV !== 'test') {
			return (
				<Editor
					disabled={ this.props.isReadOnly }
					value={ this.state.content }
					init={{
						height: '100%',
						base_url: this.props.tinymceRoot,
						plugins: 'link searchreplace',
						branding: false,
						toolbar: false,
						menubar: false,
						statusbar: false,
						theme: 'silver',
						mobile: { theme: 'silver' },
						valid_elements: validElements,
						invalid_elements: invalidElements,
						content_css: `/static/tinymce-content.css`,
					}}
					onClick={ this.refreshEditor }
					onEditorChange={ this.handleEditorChange }
					onFocus={ this.handleFocus }
					onInit={ this.handleEditorInit }
				/>
			);
		} else return null;
	}

	render() {
		const { device, isReadOnly, isTinymceFetched } = this.props;
		if(!isTinymceFetched) {
			return <Spinner />;
		}
		return (
			<div className="rich-editor">
				{ device.isSingleColumn || !isReadOnly && (
					<div className="toolbar-container">
						<Toolbar className="dense">
							<div className="toolbar-left">
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('bold')
										})}
										title="Bold"
										data-command="bold"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/b" className="touch" width="24" height="24" />
										<Icon type="16/editor/b" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('italic')
										})}
										title="Italic"
										data-command="italic"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/i" className="touch" width="24" height="24" />
										<Icon type="16/editor/i" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('underline')
										})}
										title="Underline"
										data-command="underline"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/u" className="touch" width="24" height="24" />
										<Icon type="16/editor/u" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('strikethrough')
										})}
										title="strikethrough"
										data-command="strikethrough"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/s" className="touch" width="24" height="24" />
										<Icon type="16/editor/s" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('subscript')
										})}
										title="Subscript"
										data-command="subscript"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/sub" className="touch" width="24" height="24" />
										<Icon type="16/editor/sub" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('superscript')
										})}
										title="Superscript"
										data-command="superscript"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/sup" className="touch" width="24" height="24" />
										<Icon type="16/editor/sup" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Dropdown
										isOpen={ this.state.dropdowns['forecolor'] }
										toggle={ this.handleDropdownToggle }
										data-dropdown="forecolor"
										className="btn-group"
									>
										<Button
											icon
											data-command="forecolor"
											onClick={ this.handleButtonClick }
										>
											<Icon type="24/editor/fore-color" className="touch" width="24" height="24" />
											<Icon type="16/editor/fore-color" className="mouse" width="16" height="16" />
											<Icon
												type="24/editor/color-swatch"
												className="touch"
												color={ this.state.forecolor }
												width="24"
												height="24"
											/>
											<Icon
												type="16/editor/color-swatch"
												className="mouse"
												color={ this.state.forecolor }
												width="16"
												height="16"
											/>
										</Button>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="btn-icon dropdown-toggle"
										>
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<ColorPicker onColorPicked={ this.handleForeColorPicked } />
									</Dropdown>
									<Dropdown
										isOpen={ this.state.dropdowns['hilitecolor'] }
										toggle={ this.handleDropdownToggle }
										data-dropdown="hilitecolor"
										className="btn-group"
									>
										<Button
											icon
											data-command="hilitecolor"
											onClick={ this.handleButtonClick }
										>
											<Icon type="24/editor/hilite-color" className="touch" width="24" height="24" />
											<Icon type="16/editor/hilite-color" className="mouse" width="16" height="16" />
											<Icon
												type="24/editor/color-swatch"
												className="touch"
												color={ this.state.hilitecolor }
												width="24"
												height="24"
											/>
											<Icon
												type="16/editor/color-swatch"
												className="mouse"
												color={ this.state.hilitecolor }
												width="16"
												height="16"
											/>
										</Button>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="btn-icon dropdown-toggle"
										>
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<ColorPicker onColorPicked={ this.handleHiLiteColorPicked } />
									</Dropdown>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										title="Clear formatting"
										data-command="removeformat"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/remove-format" className="touch" width="24" height="24" />
										<Icon type="16/editor/remove-format" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('mceblockquote')
										})}
										title="Blockquote"
										data-command="mceblockquote"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/blockquote" className="touch" width="24" height="24" />
										<Icon type="16/editor/blockquote" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Insert/edit link"
										data-command="mceLink"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/link" className="touch" width="24" height="24" />
										<Icon type="16/editor/link" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Dropdown
										isOpen={ this.state.dropdowns['overflow-1'] }
										toggle={ this.handleDropdownToggle}
										data-dropdown="overflow-1"
									>
										<DropdownToggle
											color={ null }
											className="btn-icon dropdown-toggle"
										>
										<Icon type="24/options" width="24" height="24" />
										</DropdownToggle>
										<DropdownMenu right>
											<DropdownItem
												tag={ Button }
												title="Subscript"
												data-command="subscript"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/sub" className="touch" width="24" height="24" />
												Subscript
											</DropdownItem>
											<DropdownItem
												tag={ Button }
												title="Superscript"
												data-command="superscript"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/sup" className="touch" width="24" height="24" />
												Superscript
											</DropdownItem>
											<DropdownItem divider />
											<DropdownItem
												tag={ Button }
												className="remove-format"
												title="Clear formatting"
												data-command="removeformat"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/remove-format" className="touch" width="24" height="24" />
												Clear Formatting
											</DropdownItem>
											<DropdownItem divider />
											<DropdownItem
												tag={ Button }
												className="blockquote"
												title="Blockquote"
												data-command="mceblockquote"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/blockquote" className="touch" width="24" height="24" />
												Blockquote
											</DropdownItem>
											<DropdownItem
												tag={ Button }
												className="link"
												title="Insert/edit link"
												data-command="mceLink"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/link" className="touch" width="24" height="24" />
												Insert&#8202;/&#8202;Edit Link
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</ToolGroup>
							</div>
						</Toolbar>
						<Toolbar className="dense">
							<div className="toolbar-left">
								<ToolGroup>
								<Dropdown
									isOpen={ this.state.dropdowns['formatblock'] }
									toggle={ this.handleDropdownToggle }
									data-dropdown="formatblock"
								>
										<DropdownToggle
											color={ null }
											onKeyDown={ this.handleDropdownKeyDown }
											className="dropdown-toggle btn-icon format-block"
										>
											{ this.queryFormatBlock() }
											<Icon type="16/chevron-9" className="touch" width="16" height="16" />
											<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
										</DropdownToggle>
										<DropdownMenu>
											{
												formatBlocks.map(({ value, label, Tag }) => (
													<DropdownItem
														onClick={ this.handleButtonClick }
														data-command="formatblock"
														data-value={ value }
														key={ value }
													>
														<Tag>{ label }</Tag>
													</DropdownItem>
												))
											}
										</DropdownMenu>
								</Dropdown>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifyleft')
										})}
										title="Align left"
										data-command="justifyleft"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-left" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-left" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifycenter')
										})}
										title="Align center"
										data-command="justifycenter"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-center" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-center" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('justifyright')
										})}
										title="Align right"
										data-command="justifyright"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/align-right" className="touch" width="24" height="24" />
										<Icon type="16/editor/align-right" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('insertunorderedlist')
										})}
										title="Bullet list"
										data-command="insertunorderedlist"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/bullet-list" className="touch" width="24" height="24" />
										<Icon type="16/editor/bullet-list" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										className={ cx({
											active: this.isEditorCommandState('insertorderedlist')
										})}
										title="Numbered list"
										data-command="insertorderedlist"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/numbered-list" className="touch" width="24" height="24" />
										<Icon type="16/editor/numbered-list" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Decrease indent"
										data-command="outdent"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/outdent" className="touch" width="24" height="24" />
										<Icon type="16/editor/outdent" className="mouse" width="16" height="16" />
									</Button>
									<Button
										icon
										title="Increase indent"
										data-command="indent"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/indent" className="touch" width="24" height="24" />
										<Icon type="16/editor/indent" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Button
										icon
										title="Find and replace"
										data-command="searchreplace"
										onClick={ this.handleButtonClick }>
										<Icon type="24/editor/magnifier" className="touch" width="24" height="24" />
										<Icon type="16/magnifier" className="mouse" width="16" height="16" />
									</Button>
								</ToolGroup>
								<ToolGroup>
									<Dropdown
										isOpen={ this.state.dropdowns['overflow-2'] }
										toggle={ this.handleDropdownToggle}
										data-dropdown="overflow-2"
									>
										<DropdownToggle
											color={ null }
											className="btn-icon dropdown-toggle"
										>
										<Icon type="24/options" width="24" height="24" />
										</DropdownToggle>
										<DropdownMenu right>
											<DropdownItem
												tag={ Button }
												className="bullet-list"
												title="Bullet list"
												data-command="insertunorderedlist"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/bullet-list" className="touch" width="24" height="24" />
												Bullet List
											</DropdownItem>
											<DropdownItem
												tag={ Button }
												className="numbered-list"
												title="Numbered list"
												data-command="insertorderedlist"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/numbered-list" className="touch" width="24" height="24" />
												Numbered List
											</DropdownItem>
											<DropdownItem
												tag={ Button }
												className="outdent"
												title="Decrease indent"
												data-command="outdent"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/outdent" className="touch" width="24" height="24" />
												Decrease Indent
											</DropdownItem>
											<DropdownItem
												tag={ Button }
												className="indent"
												title="Increase indent"
												data-command="indent"
												onClick={ this.handleButtonClick }
											>
												<Icon type="24/editor/indent" className="touch" width="24" height="24" />
												Increase Indent
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</ToolGroup>
							</div>
						</Toolbar>
					</div>
				)}
				<div className="editor-container">
					{ this.renderEditor() }
				</div>
			</div>
		);
	}
}

RichEditor.propTypes = {
	device: PropTypes.object,
	isReadOnly: PropTypes.bool,
	isTinymceFetched: PropTypes.bool,
	isTinymceFetching: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	sourceFile: PropTypes.func,
	tinymceRoot: PropTypes.string,
	value: PropTypes.string,
};

RichEditor.defaultProps = {
	tinymceRoot: '/'
};

export default RichEditor;
