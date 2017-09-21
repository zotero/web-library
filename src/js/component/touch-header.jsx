'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Button = require('./ui/button');
const InjectableComponentsEnhance = require('../enhancers/injectable-components-enhancer');

class TouchHeader extends React.Component {
	collectionSelectedHandler(key, ev) {
		ev && ev.preventDefault();
		this.props.onCollectionSelected(key, ev);
	}

	render() {
		let TouchNavigation = this.props.components['TouchNavigation'];
		if(this.props.editing) {
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
	editing: PropTypes.bool,
	view: PropTypes.string
};

TouchHeader.defaultProps = {
	path: []
};

module.exports = InjectableComponentsEnhance(TouchHeader);