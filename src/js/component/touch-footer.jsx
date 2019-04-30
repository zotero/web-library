'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar, ToolGroup } from './ui/toolbars';
import Icon from './ui/icon';
import Button from './ui/button';

class TouchFooter extends React.PureComponent {
	render() {
		const { itemKeys, isReadOnly, itemsSource, onAddToCollectionModalOpen,
			onPermanentlyDelete, onUndelete, onRemoveFromCollection,
			onDuplicate, onTrash, onExportModalOpen, onBibliographyModalOpen } = this.props;
		return (
			<footer className="touch-footer">
				<Toolbar>
					<div className="toolbar-justified">
						<ToolGroup>
							{ !isReadOnly && (
								<React.Fragment>
									{
										itemsSource !== 'trash' && (
										<Button icon onClick={ onAddToCollectionModalOpen } disabled={ itemKeys.length === 0 }>
											<Icon type={ '32/add-to-collection' } width="32" height="32" />
										</Button>
									)}
									{
										itemsSource === 'collection' && (
											<Button icon onClick={ onRemoveFromCollection } disabled={ itemKeys.length === 0 }>
												<Icon type={ '32/remove-from-collection' } width="32" height="32" />
											</Button>
									)}
									{
										itemsSource !== 'trash' && (
											<Button icon onClick={ onTrash } disabled={ itemKeys.length === 0 } >
												<Icon type={ '24/trash' } width="24" height="24" />
											</Button>
									)}
									{
										itemsSource === 'trash' && (
											<Button icon onClick={ onUndelete } disabled={ itemKeys.length === 0 } >
												<Icon type={ '24/restore' } width="24" height="24" />
											</Button>
									)}
									{
										itemsSource === 'trash' && (
											<Button icon onClick={ onPermanentlyDelete } disabled={ itemKeys.length === 0 } >
												<Icon type={ '24/empty-trash' } width="24" height="24" />
											</Button>
									)}
									{
										(itemsSource === 'collection' || itemsSource === 'top') && (
											<Button icon onClick={ onDuplicate } disabled={ itemKeys.length !== 1 }>
												<Icon type={ '24/duplicate' } width="24" height="24" />
											</Button>
									)}
								</React.Fragment>
							) }
							<Button icon onClick={ onExportModalOpen } disabled={ itemKeys.length === 0 }>
								<Icon type={ '24/export' } width="24" height="24" />
							</Button>
							<Button icon disabled={ itemKeys.length === 0 }>
								<Icon type={ '24/cite' } width="24" height="24" />
							</Button>
							<Button icon onClick={ onBibliographyModalOpen } disabled={ itemKeys.length === 0 }>
								<Icon type={ '24/bibliography' } width="24" height="24" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</footer>
		)
	}

	static propTypes = {
		itemKeys: PropTypes.array,
		itemsSource: PropTypes.string,
		onAddToCollectionModalOpen: PropTypes.func.isRequired,
		onBibliographyModalOpen: PropTypes.func.isRequired,
		onDuplicate: PropTypes.func.isRequired,
		onExportModalOpen: PropTypes.func.isRequired,
		onPermanentlyDelete: PropTypes.func.isRequired,
		onRemoveFromCollection: PropTypes.func.isRequired,
		onTrash: PropTypes.func.isRequired,
		onUndelete: PropTypes.func.isRequired,
	}
}

export default TouchFooter;
