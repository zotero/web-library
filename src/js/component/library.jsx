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

class Library extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyboard: false,
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
			<div className={ cx(activeViewClass, {
					'keyboard': this.state.keyboard,
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
							<div className="items-container">
								<header className="hidden-sm-down">
									<h3 className="hidden-mouse-md-up">Collection title</h3>
									<Toolbar className="hidden-touch hidden-sm-down">
										<div className="toolbar-left">
											<ToolGroup>
												<Button>
													<Icon type={ '16/plus' } width="16" height="16" />
												</Button>
												<Button>
													<Icon type={ '16/trash' } width="16" height="16" />
												</Button>
												<Button>
													<Icon type={ '16/cog' } width="16" height="16" />
												</Button>
											</ToolGroup>
										</div>
									</Toolbar>
								</header>
								<ItemListContainer />
							</div>
							<ItemDetailsContainer active={this.props.view === 'item-details'} />
						</section>
					</section>
				</main>
			</div>
		);
	}

	keyboardSupport(ev) {
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
	view: PropTypes.string
};

module.exports = Library;
