'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Button = require('./ui/button');
const TouchNavigation = require('./touch-navigation');

class TouchHeader extends React.PureComponent {
	render() {
		if(this.props.isEditing) {
			return (
				<header className="touch-header hidden-sm-up">
					<Button
						onClick={ () => this.props.onEditingToggled(false) }
						className="btn-default btn-options"
					>
						Done
					</Button>
				</header>
			);
		} else {
			return (
				<header className="touch-header hidden-sm-up">
					<TouchNavigation
						path={ this.props.path }
						onNavigation={ this.props.onCollectionSelected }
					/>
					{ (() => {
						return this.props.view === 'item-details' && (
							<Button
								onClick={ () => this.props.onEditingToggled(true) }
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
	onEditingToggled: PropTypes.func,
	path: PropTypes.array,
	isEditing: PropTypes.bool,
	view: PropTypes.string
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = TouchHeader;
