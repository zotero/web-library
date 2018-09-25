'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');

class TouchHeader extends React.PureComponent {

	render() {
		const { isEditing, path, root, view, className, onCollectionSelected } = this.props;

		return (
			<header className={ cx('touch-header', className) }>
				{
					!isEditing && <TouchNavigation
						root={ root }
						path={ path }
						onNavigation={ onCollectionSelected }
					/>
				}
				{ view === 'item-details' && (
					<EditToggleButton className="btn-default btn-options" />
				)}
			</header>
		)
	}
}

TouchHeader.propTypes = {
	onCollectionSelected: PropTypes.func,
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
