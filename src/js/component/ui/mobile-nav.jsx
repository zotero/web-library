'use strict';

import React from 'react';
import PropTypes from 'prop-types';
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
		const { onFocus, onBlur, registerFocusRoot } = this.props;
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
						<li className="nav-item active">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								My Library
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Groups
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Documentation
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Forums
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Get Involved
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link separated"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								User Name
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link separated"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Inbox
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link separated"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Settings
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Log Out
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
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
		toggleNavbar: PropTypes.bool,
	}
}

export default withFocusManager(MobileNav);
