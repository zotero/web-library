'use strict';

import React from 'react';
import cx from 'classnames';

import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';

class Library extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyboard: false,
			isNavOpened: false
		};
	}

	navToggleHandler() {
		this.setState({
			isNavOpened: !this.state.isNavOpened
		});
	}

	render() {
		let CollectionTree = this.props.components['CollectionTree'];
		let ItemDetails = this.props.components['ItemDetails'];
		let ItemList = this.props.components['ItemList'];
		let Navbar = this.props.components['Navbar'];
		let TagSelector = this.props.components['TagSelector'];
		let TouchHeader = this.props.components['TouchHeader'];
		
		let activeViewClass = `view-${this.props.view}-active`;

		return (
			<div className={ cx({
					activeViewClass,
					'keyboard': this.state.keyboard,
					'navbar-nav-opened': this.state.isNavOpened
				}) }>
				<Navbar
					isOpened = { this.state.isNavOpened }
					onToggle = { this.navToggleHandler.bind(this) }  />
				<main>
					<section className={ `library ${ this.props.view === 'library' ? 'active' : '' }` }>
						<TouchHeader />
						<header className="sidebar">
							<h2 className="offscreen">Web library</h2>
							<CollectionTree />
							<TagSelector />
						</header>
						<section className={ `items ${ this.props.view === 'item-list' ? 'active' : '' }` }>
							<header className="touch-header hidden-xs-down hidden-md-up">Tablet Header</header>
							<div className="items-container">
								<header className="hidden-sm-down">
									<h3 className="hidden-mouse-md-up">Collection title</h3>
									<div className="toolbar hidden-touch hidden-sm-down">Toolbar</div>
								</header>
								<ItemList />
							</div>
							<ItemDetails active={this.props.view === 'item-details'} />
						</section>
					</section>
				</main>
			</div>
		);
	}

	keyboardSupport(ev) {
		console.log(ev);
		if(ev.key === 'Tab') {
			this.setState({
				'keyboard': true
			});
		}
	}

	componentDidMount() {
		this._keyboardListener = this.keyboardSupport.bind(this);
		document.addEventListener('keyup', this._keyboardListener);
	}


	componentWillUnmount() {
		document.removeEventListener('keyup', this._keyboardListener);
	}
}

Library.propTypes = {
	view: React.PropTypes.string
};

export default InjectableComponentsEnhance(Library);
