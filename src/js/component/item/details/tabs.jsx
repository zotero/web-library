/* eslint-disable react/no-deprecated */
'use strict';

import React from 'react';
import Panel from '../../ui/panel';
import cx from 'classnames';
import { Tab, Tabs } from '../../ui/tabs';
import InfoTabPane from './tab-panes/info';
import NotesTabPane from './tab-panes/notes';
import TagsTabPane from './tab-panes/tags';
import AttachmentsTabPane from './tab-panes/attachments';
import RelatedTabPane from './tab-panes/related';
import StandaloneNoteTabPane from './tab-panes/standalone-note';
import EditToggleButton from '../../edit-toggle-button';
import StandaloneAttachmentTabPane from './tab-panes/standalone-attachment';
import Spinner from '../../ui/spinner';

class ItemDetailsTabs extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			tab: this.pickDefaultActiveTab(props.item.itemType)
		};
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
		this.setState({ tab: this.defaultActiveTab });
	}

	pickDefaultActiveTab(itemType) {
		switch(itemType) {
			case 'note':
				return 'standalone-note';
			case 'attachment':
				return 'standalone-attachment';
			default:
				return 'info';
		}
	}

	get defaultActiveTab() {
		return this.pickDefaultActiveTab(this.props.item.itemType);
	}

	render() {
		const { device, isLoadingMeta, isLoadingChildItems, isLoadingRelated,
			isReadOnly } = this.props;
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
								<EditToggleButton
									isReadOnly={ isReadOnly }
									className="hidden-mouse-lg-up btn-link btn-edit"
								/>
							)
						}
				</header>
				{
					// on small devices, where tabs are not used, we display single spinner
					isLoading && !device.shouldUseTabs ? <Spinner className="large" /> : (
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
									<StandaloneNoteTabPane
										isActive={ this.state.tab === 'standalone-note' }
										{ ...this.props }
									/>
								)
							}

							{
								this.props.item.itemType === 'attachment' && (
									<StandaloneAttachmentTabPane
										isActive={ this.state.tab === 'standalone-attachment' }
										{ ...this.props }
									/>
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

export default ItemDetailsTabs;
