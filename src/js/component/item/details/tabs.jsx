/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const Panel = require('../../ui/panel');
const cx = require('classnames');
const { Tab, Tabs } = require('../../ui/tabs');
const InfoTabPane = require('./tab-panes/info');
const NotesTabPane = require('./tab-panes/notes');
const TagsTabPane = require('./tab-panes/tags');
const AttachmentsTabPane = require('./tab-panes/attachments');
const RelatedTabPane = require('./tab-panes/related');
const StandaloneNoteTabPane = require('./tab-panes/standalone-note');
const EditToggleButton = require('../../edit-toggle-button');
const Spinner = require('../../ui/spinner');

class ItemDetailsTabs extends React.PureComponent {
	state = {
		tab: null
	};

	componentDidMount() {
		this.setDefaultActiveTab(this.props);
	}

	componentDidUpdate() {
		const { item: { itemType } } = this.props;
		const { tab } = this.state;

		if(tab === 'standalone-note' && itemType != 'note') {
			this.setDefaultActiveTab();
		}
		if(tab === 'standalone-attachment' && itemType != 'attachment') {
			this.setDefaultActiveTab();
		}

		if(['info', 'notes', 'attachments'].includes(tab) &&
			['note', 'attachment'].includes(itemType)) {
			this.setDefaultActiveTab();
		}
	}

	setDefaultActiveTab() {
		switch(this.props.item.itemType) {
			case 'note':
				this.setState({ tab: 'standalone-note' });
			break;
			case 'attachment':
				this.setState({ tab: 'standalone-attachment' });
			break;
			default:
				this.setState({ tab: 'info' });
			break;
		}
	}

	render() {
		const { device, isLoadingMeta, isLoadingChildItems, isLoadingRelated,
			isEditing, onEditModeToggle } = this.props;
		const isLoading = isLoadingMeta || isLoadingChildItems || isLoadingRelated;

		return (
			<Panel bodyClassName={ cx({ 'loading': isLoading && !device.shouldUseTabs }) }>
				<header>
					<h4 className="offscreen">
						{ this.props.title }
					</h4>
					<Tabs compact>
						{
							this.props.item.itemType === 'note' && (
								<Tab
									isActive={ this.state.tab === 'standalone-note' }
									onActivate={ () => this.setState({ tab: 'standalone-note' }) }
									>
										Note
								</Tab>
							)
						}
						{
							this.props.item.itemType === 'attachment' && (
								<Tab
									isActive={ this.state.tab === 'standalone-attachment' }
									onActivate={ () => this.setState({ tab: 'standalone-attachment' }) }
									>
										Attachment
								</Tab>
							)
						}
						{
							!['attachment', 'note'].includes(this.props.item.itemType) && (
								<React.Fragment>
									<Tab
										isActive={ this.state.tab === 'info' }
										onActivate={ () => this.setState({ tab: 'info' }) }
									>
										Info
									</Tab>
									<Tab
										isActive={ this.state.tab === 'notes' }
										onActivate={ () => this.setState({ tab: 'notes' }) }
										>
											Notes
									</Tab>
								</React.Fragment>
							)
						}

						<Tab
							isActive={ this.state.tab === 'tags' }
							onActivate={ () => this.setState({ tab: 'tags' }) }
						>
							Tag
						</Tab>
						{
							!['attachment', 'note'].includes(this.props.item.itemType) && (
								<Tab
								isActive={ this.state.tab === 'attachments' }
								onActivate={ () => this.setState({ tab: 'attachments' }) }
								>
									Attachments
								</Tab>
							)
						}

						<Tab
							isActive={ this.state.tab === 'related' }
							onActivate={ () => this.setState({ tab: 'related' }) }
						>
							Related
						</Tab>
					</Tabs>
						{
							this.state.tab === 'info' && (
								<EditToggleButton className="hidden-mouse-lg-up btn-edit" />
							)
						}
				</header>
				{
					// on small devices, where tabs are not used, we display single spinner
					isLoading && !device.shouldUseTabs ? <Spinner /> : (
						<React.Fragment>
							{
								!['attachment', 'note'].includes(this.props.item.itemType) && (
									<React.Fragment>
										<InfoTabPane isActive={ this.state.tab === 'info' } { ...this.props } />
										<NotesTabPane isActive={ this.state.tab === 'notes' } { ...this.props } />
									</React.Fragment>
								)
							}

							{
								this.props.item.itemType === 'note' && (
									<StandaloneNoteTabPane isActive={ this.state.tab === 'standalone-note' } { ...this.props } />
								)
							}

							<TagsTabPane isActive={ this.state.tab === 'tags' } { ...this.props } />
							{
								!['attachment', 'note'].includes(this.props.item.itemType) && (
									<AttachmentsTabPane isActive={ this.state.tab === 'attachments' } { ...this.props } />
								)
							}
							<RelatedTabPane isActive={ this.state.tab === 'related' } { ...this.props } />
						</React.Fragment>
					)
				}

			</Panel>
		);
	}

	static defaultProps = {
		item: {}
	}
}

module.exports = ItemDetailsTabs;
