'use strict';
import React from 'react';
import Tab from './tab';

export default class Tabset extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			active: props.active
		};
	}

	setActiveTab(active, ev) {
		ev.preventDefault();
		this.setState({
			active
		});
	}

	renderTabHeaders() {
		let tabHeaders = [];
		let counter = 0;
		if(Array.isArray(this.props.children)) {
			for(let child of this.props.children) {
				if(child.type === Tab) {
					let tabIndex = counter;
					tabHeaders.push(
						<li key={ tabIndex } className={ this.state.active === tabIndex ? 'active' : '' }>
							<a href="#" onClick={ ev => this.setActiveTab(tabIndex, ev) }>
							{ child.props.title }
							</a>
						</li>
					);
					counter++;
				}
			}
		}

		return tabHeaders;
	}

	renderTabContents() {
		let tabContents = [];
		let counter = 0;
		if(Array.isArray(this.props.children)) {
			for(let child of this.props.children) {
				if(child.type === Tab) {
					tabContents.push(
						<div key={ counter } className="tab-content">
							<div className={ `tab-pane ${this.state.active === counter ? 'active' : ''}` }>
								{ child }
							</div>
						</div>
					);
					counter++;
				}
			}
		}

		return tabContents;
	}

	render() {
		return (
			<div className="panel">
				<header className="panel-header">
					<h4 className="offscreen">
							{ this.props.title }
					</h4>
					<nav>
						<ul className="tabs compact">
							{ this.renderTabHeaders() }
						</ul>
					</nav>
				</header>
				<div className="panel-body">
					{ this.renderTabContents() }
				</div>
			</div>
		);
	}
}

Tabset.propTypes = {
	title: React.PropTypes.string,
	children: React.PropTypes.node,
	active: React.PropTypes.number
};

Tabset.defaultProps = {
	children: null,
	active: 0
};