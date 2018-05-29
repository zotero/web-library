/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const Panel = require('../../ui/panel');
const { Tab, Tabs } = require('../../ui/tabs');
const InfoTab = require('./tabs/info');
const NotesTab = require('./tabs/notes');
const TagsTab = require('./tabs/tags');
const AttachmentsTab = require('./tabs/attachments');
const RelatedTab = require('./tabs/related');
const StandaloneNoteTab = require('./tabs/standalone-note');

class ItemDetailsTabs extends React.PureComponent {
	state = {
		tab: null
	};

	componentDidMount() {
		this.setDefaultActiveTab(this.props);
	}

	componentWillReceiveProps(props) {
		if(this.state.tab == null || this.props.item.key !== props.item.key) {
			this.setDefaultActiveTab(props);
		}
	}

	setDefaultActiveTab(props) {
		switch(props.item.itemType) {
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
		return (
			<Panel>
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
				</header>
				{
					!['attachment', 'note'].includes(this.props.item.itemType) && (
						<React.Fragment>
							<InfoTab isActive={ this.state.tab === 'info' } { ...this.props } />
							<NotesTab isActive={ this.state.tab === 'notes' } { ...this.props } />
						</React.Fragment>
					)
				}

				{
					this.props.item.itemType === 'note' && (
						<StandaloneNoteTab isActive={ this.state.tab === 'standalone-note' } { ...this.props } />
					)
				}

				<TagsTab isActive={ this.state.tab === 'tags' } { ...this.props } />
				{
					!['attachment', 'note'].includes(this.props.item.itemType) && (
						<AttachmentsTab isActive={ this.state.tab === 'attachments' } { ...this.props } />
					)
				}
				<RelatedTab isActive={ this.state.tab === 'related' } { ...this.props } />
			</Panel>
		);
	}

	static defaultProps = {
		item: {}
	}
}

module.exports = ItemDetailsTabs;
