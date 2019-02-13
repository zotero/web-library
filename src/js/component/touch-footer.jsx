'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { Toolbar, ToolGroup } = require('./ui/toolbars');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class TouchFooter extends React.PureComponent {
	render() {
		const { itemKeys, onAddToCollectionModalOpen, onPermanentlyDelete, onUndelete,
			onRemoveFromCollection, onDuplicate, onTrash, onExportModalOpen,
			onBibliographyModalOpen } = this.props;
		return (
			<footer className="touch-footer">
				<Toolbar>
					<div className="toolbar-justified">
						<ToolGroup>
							<Button onClick={ onAddToCollectionModalOpen } disabled={ itemKeys.length === 0 }>
								<Icon type={ '32/add-to-collection' } width="32" height="32" />
							</Button>
							<Button onClick={ onTrash } disabled={ itemKeys.length === 0 } >
								<Icon type={ '24/trash' } width="24" height="24" />
							</Button>
							<Button onClick={ onDuplicate } disabled={ itemKeys.length !== 1 }>
								<Icon type={ '24/duplicate' } width="24" height="24" />
							</Button>
							<Button onClick={ onExportModalOpen } disabled={ itemKeys.length === 0 }>
								<Icon type={ '24/export' } width="24" height="24" />
							</Button>
							<Button onClick={ onBibliographyModalOpen } disabled={ itemKeys.length === 0 }>
								<Icon type={ '24/bibliography' } width="24" height="24" />
							</Button>
						</ToolGroup>
					</div>
				</Toolbar>
			</footer>
		)
	}

	static propTypes = {
		onAddToCollectionModalOpen: PropTypes.func.isRequired,
		onBibliographyModalOpen: PropTypes.func.isRequired,
		onDuplicate: PropTypes.func.isRequired,
		onExportModalOpen: PropTypes.func.isRequired,
		onPermanentlyDelete: PropTypes.func.isRequired,
		onRemoveFromCollection: PropTypes.func.isRequired,
		onTrash: PropTypes.func.isRequired,
		onUndelete: PropTypes.func.isRequired,
		itemKeys: PropTypes.array,
	}
}

module.exports = TouchFooter;
