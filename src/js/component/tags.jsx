/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Editable = require('./editable');
const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class Tags extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			editingTag: null,
			processingTag: null,
			virtualTag: null
		};
	}

	componentWillReceiveProps(props) {
		if(this.props.tags != props.tags) {
			this.setState({
				virtualTag: null,
			});
		}

		if(this.props.isProcessingTags && !props.isProcessingTags) {
			this.setState({
				processingTag: null
			});
		}
	}

	handleAddTag() {
		this.setState({
			virtualTag: '',
			editingTag: '',
		});
	}

	handlePersistAddTag(newTag) {
		if(newTag === '') {
			this.handleCancelAddTag();
			return;
		}
		this.setState({
			virtualTag: newTag
		});
		this.props.onAddTag(newTag);
	}

	handleCancelAddTag() {
		if(this.state.virtualTag == '') {
			this.setState({
				processingTag: null,
				virtualTag: null
			});
		}
	}

	handleDelete(tag) {
		this.setState({
			processingTag: tag
		});
		this.props.onDeleteTag(tag);
	}

	handleEdit(tag) {
		this.setState({
			editingTag: tag
		});
	}

	handleCancel() {
		this.setState({ editingTag: null });
	}

	async handleCommit(tag, newTag, hasChanged) {
		this.setState({ editingTag: null });
		if(!hasChanged) { return; }
		this.setState({
			processingTag: tag
		});
		await this.props.onUpdateTag(tag, newTag);
	}

	render() {
		let tags = [...this.props.tags];
		tags.sort((t1, t2) => t1.tag > t2.tag);
		return (
			<div className="details-list tags">
				<nav>
					<ul className="nav list">
						{
							tags.map(tag => {
								return (
									<li className="item" key={ tag.tag } >
										<Icon type={ '16/tag' } width="16" height="16" />
											<Editable
												autoFocus
												isBusy={ this.state.processingTag === tag.tag }
												isActive={ this.state.editingTag === tag.tag }
												value={ tag.tag }
												onCommit={ this.handleCommit.bind(this, tag.tag) }
												onCancel={ this.handleCancel.bind(this) }
												onEditableClick={ this.handleEdit.bind(this, tag.tag) }
												onEditableFocus={ this.handleEdit.bind(this, tag.tag) }
											/>
										<Button
											className="btn-icon"
											disabled={ this.props.isProcessingTags }
											onClick={ () => this.handleDelete(tag.tag) }
										>
											<Icon type={ '16/trash' } width="16" height="16" />
										</Button>
									</li>
								);
							})
						}
						{
							this.state.virtualTag !== null && (
								<li className="item virtual">
									<Icon type={ '16/tag' } width="16" height="16" />
									<Editable
										autoFocus
										isBusy={ this.state.virtualTag !== '' }
										isActive={ this.state.editingTag === '' }
										value={ this.state.virtualTag }
										onCancel={ this.handleCancelAddTag.bind(this) }
										onCommit={ newValue => this.handlePersistAddTag(newValue) }
									/>
								</li>
							)
						}
					</ul>
				</nav>

				<Toolbar>
					<div className="toolbar-left">
						<ToolGroup>
							<Button onClick={ this.handleAddTag.bind(this) }>
								<Icon type={ '16/plus' } width="16" height="16" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</div>
		);
	}
}

Tags.propTypes = {
	onAddTag: PropTypes.func.isRequired,
	onDeleteTag: PropTypes.func.isRequired,
	onUpdateTag: PropTypes.func.isRequired,
	isProcessingTags: PropTypes.bool,
	tags: PropTypes.array,
};

Tags.defaultProps = {
	tags: []
};

module.exports = Tags;
