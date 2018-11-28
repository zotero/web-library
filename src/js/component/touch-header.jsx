'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');
const CollectionActions = require('./touch-header/collection-actions');
const ItemListActions = require('./touch-header/item-list-actions');
const TouchHeaderContainer = require('../container/touch-header');
const Icon = require('./ui/icon');

class TouchHeader extends React.PureComponent {

	render() {
		const { isEditing, variant, path, root, view, className, onNavigation,
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
					shouldIncludeItemListOptions && <ItemListActions { ...this.props } />
				}
				{ shouldIncludeEditButton && (
					<EditToggleButton className="btn-default btn-edit" />
				)}
			</header>
		)
	}
}

TouchHeader.propTypes = {
	onNavigation: PropTypes.func,
	onEditModeToggle: PropTypes.func,
	path: PropTypes.array,
	isEditing: PropTypes.bool,
	view: PropTypes.string,
	className: PropTypes.string,
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = TouchHeader;
