'use strict';

import cx from 'classnames';
import Panel from '../../ui/panel';
import PropTypes from 'prop-types';
import React from 'react';

import AttachmentsContainer from '../../../container/attachments';
import EditToggleButton from '../../edit-toggle-button';
import InfoTabPane from './tab-panes/info';
import NotesContainer from '../../../container/notes';
import RelatedContainer from '../../../container/related';
import Spinner from '../../ui/spinner';
import StandaloneAttachmentContainer from '../../../container/standalone-attachment';
import StandaloneNoteContainer from '../../../container/standalone-note';
import TagsContainer from '../../../container/tags';
import { pick } from '../../../common/immutable';
import { Tab, Tabs } from '../../ui/tabs';

//@TODO: container for other tabs as well
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
	handleKeyDown = ev => {
		if(ev.key === 'ArrowDown' && ev.target.closest('.tab')) {
			ev.currentTarget.querySelector('.tab-pane.active [tabIndex]').focus();
		}
		if(ev.key === 'Escape') {
			//@TODO: do this in a more elegant way
			document.querySelector('.items-table [tabIndex="0"]').focus();
		}
	}

	get defaultActiveTab() {
		return this.pickDefaultActiveTab(this.props.item.itemType);
	}

	render() {
		const { device, isLoadingMeta, isEditing, isLoadingChildItems,
			isLoadingRelated, isReadOnly, title, item } = this.props;
		const isLoading = isLoadingMeta || isLoadingChildItems || isLoadingRelated;

		return (
			<Panel
				className={ cx({ 'editing': isEditing })}
				bodyClassName={ cx({ 'loading': isLoading && !device.shouldUseTabs }) }
				onKeyDown={ this.handleKeyDown }
			>
				<header>
					<h4 className="offscreen">
						{ title }
					</h4>
					<Tabs compact>
						{
							item.itemType === 'note' && (
								<Tab
									isActive={ this.state.tab === 'standalone-note' }
									onActivate={ () => this.setState({ tab: 'standalone-note' }) }
									>
										Note
								</Tab>
							)
						}
						{
							item.itemType === 'attachment' && (
								<Tab
									isActive={ this.state.tab === 'standalone-attachment' }
									onActivate={ () => this.setState({ tab: 'standalone-attachment' }) }
									>
										Attachment
								</Tab>
							)
						}
						{
							!['attachment', 'note'].includes(item.itemType) && (
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
							Tags
						</Tab>
						{
							!['attachment', 'note'].includes(item.itemType) && (
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
								!['attachment', 'note'].includes(item.itemType) && (
									<React.Fragment>
										<InfoTabPane isActive={ this.state.tab === 'info' } { ...this.props } />
										<NotesContainer
											key={ 'notes-' + item.key }
											isActive={ this.state.tab === 'notes' }
											{ ... pick(this.props, ['isReadOnly', 'onBlur', 'onFocus', 'registerFocusRoot']) }
										/>
									</React.Fragment>
								)
							}

							{
								item.itemType === 'note' && (
									<StandaloneNoteContainer
										key={ 'standalone-note-' + item.key }
										isActive={ this.state.tab === 'standalone-note' }
									/>
								)
							}

							{
								item.itemType === 'attachment' && (
									<StandaloneAttachmentContainer isActive={ this.state.tab === 'standalone-attachment' } />
								)
							}

							<TagsContainer key={ item.key } isActive={ this.state.tab === 'tags' } />
							{
								!['attachment', 'note'].includes(item.itemType) && (
									<AttachmentsContainer
										key={ 'attachments-' + item.key }
										isActive={ this.state.tab === 'attachments' }
										{ ... pick(this.props, ['isReadOnly', 'onBlur', 'onFocus', 'registerFocusRoot']) }
									/>
								)
							}
							<RelatedContainer
								key={ 'related-' + item.key }
								isActive={ this.state.tab === 'related' }
							/>
						</React.Fragment>
					)
				}

			</Panel>
		);
	}

	static propTypes = {
		device: PropTypes.object,
		isEditing: PropTypes.bool,
		isLoadingChildItems: PropTypes.bool,
		isLoadingMeta: PropTypes.bool,
		isLoadingRelated: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		item: PropTypes.object,
		title: PropTypes.string,
	}

	static defaultProps = {
		item: {}
	}
}

export default ItemDetailsTabs;
