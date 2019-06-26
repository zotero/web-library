'use strict';

import React from 'react';

class MobileNav extends React.PureComponent {
	render() {
		return (
			<header className="nav-sidebar">
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
}

export default MobileNav;
