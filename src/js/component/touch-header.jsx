'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');
const CollectionActions = require('./touch-header/collection-actions');
const ItemsActionsContainer = require('../container/items-actions');

class TouchHeader extends React.PureComponent {

	render() {
		const { isEditing, path, className, onNavigation,
			shouldIncludeEditButton, shouldIncludeItemListOptions,
			shouldIncludeCollectionOptions } = this.props;
		return (
			<header className={ cx('touch-header', className) }>
				{
					(!isEditing || !shouldIncludeEditButton) && <TouchNavigation
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
			</header>
		)
	}
}

TouchHeader.propTypes = {
	className: PropTypes.string,
	isEditing: PropTypes.bool,
	onEditModeToggle: PropTypes.func,
	onNavigation: PropTypes.func,
	path: PropTypes.array,
	view: PropTypes.string,
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = TouchHeader;
