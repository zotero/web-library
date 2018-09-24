'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const Button = require('./ui/button');
const TouchNavigation = require('./touch-navigation');

class TouchHeader extends React.PureComponent {
	render() {
		const { isEditing, path, root, className } = this.props;
		if(isEditing) {
			return (
				<header className={ cx('touch-header', className) }>
					<Button
						onClick={ () => this.props.onEditModeToggle(false) }
						className="btn-default btn-options"
					>
						Done
					</Button>
				</header>
			);
		} else {
			return (
				<header className={ cx('touch-header', className) }>
					<TouchNavigation
						root={ root }
						path={ path }
						onNavigation={ this.props.onCollectionSelected }
					/>
					{ (() => {
						return this.props.view === 'item-details' && (
							<Button
								onClick={ () => this.props.onEditModeToggle(true) }
								className="btn-default btn-options"
							>
								Edit
							</Button>
						);
					})() }
				</header>
			);
		}
	}
}

TouchHeader.propTypes = {
	onCollectionSelected: PropTypes.func,
	onEditModeToggle: PropTypes.func,
	path: PropTypes.array,
	isEditing: PropTypes.bool,
	view: PropTypes.string
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = TouchHeader;
