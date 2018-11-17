'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');

class TouchHeader extends React.PureComponent {

	render() {
		const { isEditing, shouldIncludeItem, includeNav, path, root, view, className, onNavigation } = this.props;

		return (
			<header className={ cx('touch-header', className) }>
				{
					(!isEditing || !shouldIncludeItem) && includeNav && <TouchNavigation
						path={ path }
						onNavigation={ onNavigation }
					/>
				}
				{ view === 'item-details' && shouldIncludeItem && (
					<EditToggleButton className="btn-default btn-options" />
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
