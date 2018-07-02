'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Icon = require('./ui/icon');
const CollectionTreeContainer = require('../container/collection-tree');
const Button = require('./ui/button');
const ItemDetailsContainer = require('../container/item-details');
const ItemListContainer = require('../container/item-list');
const Navbar = require('./ui/navbar');
const TagSelector = require('./tag-selector');
const { Toolbar, ToolGroup } = require('./ui/toolbars');
const TouchHeaderContainer = require('../container/touch-header');
const UserTypeDetector = require('../enhancers/user-type-detector');
const { UserTypeContext } = require('../context');

class Library extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isNavOpened: false
		};
	}

	handleNavToggle() {
		this.setState({
			isNavOpened: !this.state.isNavOpened
		});
	}

	render() {
		let activeViewClass = `view-${this.props.view}-active`;

		return (
			<UserTypeContext.Provider value={ this.props.userType }>
				<div className={ cx('library-container', activeViewClass, {
						'keyboard': this.props.isKeyboardUser,
						'mouse': this.props.isMouseUser,
						'touch': this.props.isTouchUser,
						'navbar-nav-opened': this.state.isNavOpened
					}) }>
					<Navbar
						isOpened = { this.state.isNavOpened }
						onToggle = { this.handleNavToggle.bind(this) }  />
					<div className="nav-cover" />
					<main>
						<section className={ `library ${ this.props.view === 'library' ? 'active' : '' }` }>
							<TouchHeaderContainer />
							<header className="sidebar">
								<h2 className="offscreen">Web library</h2>
								<CollectionTreeContainer />
								<TagSelector />
							</header>
							<section className={ `items ${ this.props.view === 'item-list' ? 'active' : '' }` }>
								<header className="touch-header hidden-xs-down hidden-md-up">Tablet Header</header>
								<ItemListContainer />
								<ItemDetailsContainer active={this.props.view === 'item-details'} />
							</section>
						</section>
					</main>
				</div>
			</UserTypeContext.Provider>
		);
	}
}

Library.propTypes = {
	isKeyboardUser: PropTypes.bool,
	isMouseUser: PropTypes.bool,
	isTouchUser: PropTypes.bool,
	userType: PropTypes.string,
	view: PropTypes.string,
};

module.exports = UserTypeDetector(Library);
