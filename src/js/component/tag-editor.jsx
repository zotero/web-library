'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Editable = require('./editable');
const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class TagEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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
			virtualTag: ''
		});
	}

	handlePersistAddTag(newTag) {
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

	async handleUpdate(tag, newTag) {
		this.setState({
			processingTag: tag
		});
		await this.props.onUpdateTag(tag, newTag);
	}

	render() {
		let tags = [...this.props.tags];
		tags.sort((t1, t2) => t1.tag > t2.tag);
		return (
			<div className="tag-editor">
				<nav>
					<ul className="nav list">
						{
							tags.map(tag => {
								return (
									<li className="item" key={ tag.tag } >
										<Icon type={ '16/tag' } width="16" height="16" />
											<Editable
												name="tag"
												processing={ this.state.processingTag === tag.tag }
												value={ tag.tag }
												editOnClick = { !this.props.isProcessingTags }
												onSave={ newValue => this.handleUpdate(tag.tag, newValue) } 
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
										name="tag"
										processing={ this.state.virtualTag !== '' }
										shouldInitEditing={ this.state.virtualTag === '' }
										value={ this.state.virtualTag }
										editOnClick = { false }
										onToggle = { isEditing => !isEditing && this.handleCancelAddTag() }
										onSave={ newValue => this.handlePersistAddTag(newValue) } 
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

TagEditor.propTypes = {
	onAddTag: PropTypes.func.isRequired,
	onDeleteTag: PropTypes.func.isRequired,
	onUpdateTag: PropTypes.func.isRequired,
	isProcessingTags: PropTypes.bool,
	tags: PropTypes.array,
};

TagEditor.defaultProps = {
	tags: []
};

module.exports = TagEditor;