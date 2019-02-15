'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');
const CollectionActions = require('./touch-header/collection-actions');
const ItemsActionsContainer = require('../container/items-actions');
const Button = require('./ui/button');

class TouchHeader extends React.PureComponent {
	handleCancelClick = () => {
		this.props.onSelectModeToggle(false);
	}

	render() {
		const { isEditing, path, className, onNavigation,
			shouldIncludeEditButton, shouldIncludeItemListOptions,
			shouldIncludeCollectionOptions, shouldHandleSelectMode,
			isSelectMode, selectedItemsCount } = this.props;

		const shouldHideNav = (shouldIncludeEditButton && isEditing) ||
			(shouldHandleSelectMode && isSelectMode);

		return (
			<header className={ cx('touch-header', className) }>
				{
					!shouldHideNav && <TouchNavigation
						path={ path }
						onNavigation={ onNavigation }
					/>
				}
				{
					shouldIncludeCollectionOptions && <CollectionActions { ...this.props } />
				}
				{
					shouldIncludeItemListOptions && <ItemsActionsContainer />
				}
				{ shouldIncludeEditButton && (
					<EditToggleButton className="btn-link btn-edit" />
				)}
				{
					shouldHandleSelectMode && isSelectMode && (
						<React.Fragment>
							<div className="selected-items-counter">
								{ selectedItemsCount } Items Selected
							</div>
							<Button
								className="btn-link btn-cancel"
								onClick={ this.handleCancelClick }
							>
								Cancel
							</Button>
						</React.Fragment>
					)
				}
			</header>
		)
	}
}

TouchHeader.propTypes = {
	className: PropTypes.string,
	isEditing: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	onEditModeToggle: PropTypes.func,
	onNavigation: PropTypes.func,
	onSelectModeToggle: PropTypes.func,
	path: PropTypes.array,
	selectedItemsCount: PropTypes.number,
	shouldHandleSelectMode: PropTypes.bool,
	shouldIncludeCollectionOptions: PropTypes.bool,
	shouldIncludeEditButton: PropTypes.bool,
	shouldIncludeItemListOptions: PropTypes.bool,
	view: PropTypes.string,
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = TouchHeader;
