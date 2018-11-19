'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Icon = require('./ui/icon');
const Spinner = require('./ui/spinner');
const LibrariesContainer = require('../container/libraries');
const Button = require('./ui/button');
const ItemDetailsContainer = require('../container/item-details');
const ItemListContainer = require('../container/item-list');
const Navbar = require('./ui/navbar');
const TagSelectorContainer = require('../container/tag-selector');
const { Toolbar, ToolGroup } = require('./ui/toolbars');
const TouchHeaderContainer = require('../container/touch-header');
const BibliographyContainer = require('../container/bibliography');
const withDevice = require('../enhancers/with-device');

class Library extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isNavOpened: false,
			hasUserTypeChanged: false
		};
	}

	handleNavToggle() {
		this.setState({
			isNavOpened: !this.state.isNavOpened
		});
	}

	componentDidUpdate({ device: { isTouchOrSmall: wasTouchOrSmall, userType: previousUserType } }) {
		const { device } = this.props;
		const { hasUserTypeChanged } = this.state;

		document.documentElement.classList.toggle('keyboard', !!device.isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!device.isMouseUser);
		document.documentElement.classList.toggle('touch', !!device.isTouchUser);

		if(device.isTouchOrSmall !== wasTouchOrSmall && device.userType !== previousUserType) {
			this.setState({ hasUserTypeChanged: true });
		}
		if(hasUserTypeChanged === true) {
			window.setTimeout(() => this.setState({ hasUserTypeChanged: false }));
		}
	}

	componentWillUnmount() {
		document.documentElement.classList.toggle('keyboard', false);
		document.documentElement.classList.toggle('mouse', false);
		document.documentElement.classList.toggle('touch', false);
	}

	render() {
		const { itemsSource, collectionKey, useTransitions, view, device } = this.props;
		const { isNavOpened, hasUserTypeChanged } = this.state;
		const key = itemsSource === 'collection' ?
			`collection-${collectionKey}` :
			itemsSource;
		let activeViewClass = `view-${view}-active`;

		return (
			<div className={ cx('library-container', activeViewClass, {
					'navbar-nav-opened': isNavOpened,
					'no-transitions': !useTransitions || hasUserTypeChanged
				}) }>
				{
					!useTransitions && (
						<div className="loading-cover">
							<Spinner />
						</div>
					)
				}
				<Navbar
					isOpened = { isNavOpened }
					onToggle = { this.handleNavToggle.bind(this) }  />
				<div className="nav-cover" />
				<main>
					<section className={ `library ${ view === 'library' ? 'active' : '' }` }>
						<TouchHeaderContainer
							className="hidden-sm-up"
							variant={ TouchHeaderContainer.variants.MOBILE }
						/>
						<header className="sidebar">
							<h2 className="offscreen">Web library</h2>
							<LibrariesContainer />
							<TagSelectorContainer key={ key } />
						</header>
						<section className={ `items ${ view === 'item-list' ? 'active' : '' }` }>
							{/* Tablet TouchHeader */}
							<TouchHeaderContainer
								key={ key }
								className="hidden-xs-down hidden-md-up"
								variant={ TouchHeaderContainer.variants.SOURCE_AND_ITEM }
							/>
							<ItemListContainer />
							<ItemDetailsContainer active={ view === 'item-details' } />
						</section>
					</section>
				</main>
				<BibliographyContainer />
			</div>
		);
	}
}

Library.propTypes = {
	view: PropTypes.string,
};

module.exports = withDevice(Library);
