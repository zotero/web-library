'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const TouchNavigation = require('./touch-navigation');
const EditToggleButton = require('./edit-toggle-button');
const Icon = require('./ui/icon');

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
				<div className="dropdown-wrapper dropdown">
					<button className="btn btn-icon dropdown-toggle">
							<Icon type="24/options" width="24" height="24" />
					</button>
				</div>
				{ view === 'item-details' && shouldIncludeItem && (
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
