'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import MobileMenuEntry from './menu-entry-mobile';
import withFocusManager from '../../enhancers/with-focus-manager';

class MobileNav extends React.PureComponent {
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
		const { entries, onFocus, registerFocusRoot } = this.props;

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
						{ entries.map( entry => (
							<MobileMenuEntry
								key={ entry.href }
								onKeyDown={ this.handleKeyDown }
								{...entry}
							/>
						))}
					</ul>
				</nav>
			</header>
		);
	}

	static propTypes = {
		entries: PropTypes.array,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		registerFocusRoot: PropTypes.func,
		toggleNavbar: PropTypes.func,
	}

	static defaultProps = {
		entries: []
	}
}

export default withFocusManager(MobileNav);
