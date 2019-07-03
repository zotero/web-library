'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import withFocusManager from '../../enhancers/with-focus-manager';

import { NavItem, NavLink } from 'reactstrap/lib';
import cx from 'classnames';

class MobileMenuEntry extends React.PureComponent {
	render() {
		const {label, href, separated, handleKeyDown} = this.props;
		return (
			<NavItem>
				<NavLink href={href} className={cx({separated})} onKeyDown={ handleKeyDown } tabIndex={ -2 }>{label}</NavLink>
			</NavItem>
		);
	}
}
MobileMenuEntry.propTypes = {
	label: PropTypes.string,
	href: PropTypes.string,
	handleKeyDown: PropTypes.func,
	dropdown: PropTypes.bool,
	entries: PropTypes.array,
	separated: PropTypes.bool,
}

class MobileNav extends React.PureComponent {
	constructor(props) {
		super(props);
		const menuConfigDom = document.getElementById('zotero-web-library-menu-config');
		const config = menuConfigDom ? JSON.parse(menuConfigDom.textContent) : {};

		this.state = {
			menus: config
		};
	}
	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowDown') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			onFocusPrev(ev);
		}
	}

	handleBlur = ev => {
		const { onBlur, toggleNavbar } = this.props;
		onBlur(ev);

		if(ev.relatedTarget &&
			(ev.relatedTarget === this.ref || ev.relatedTarget.closest('[data-focus-root]') === this.ref)
		) {
				return;
		}
		toggleNavbar(false);
	}

	render() {
		const { onFocus, onBlur, registerFocusRoot } = this.props;
		const {menus} = this.state;
		const mobileMenuEntries = menus.mobile.map((entry) => {
			return <MobileMenuEntry key={entry.href} {...entry} handleKeyDown={this.handleKeyDown} />;
		})
		
		return (
			<header
				className="nav-sidebar"
				onBlur={ this.handleBlur }
				onFocus={ onFocus }
				ref={ ref => { this.ref = ref; registerFocusRoot(ref); } }
				tabIndex={ -1 }
			>
				<nav>
					<ul className="mobile-nav">
						{mobileMenuEntries}
						<li className="nav-item">
							<a
								href="/settings/storage"
								className="nav-link separated"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Upgrade Storage
							</a>
						</li>
					</ul>
				</nav>
			</header>
		);
	}

	static propTypes = {
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		registerFocusRoot: PropTypes.func,
		toggleNavbar: PropTypes.func,
	}
}

export default withFocusManager(MobileNav);
