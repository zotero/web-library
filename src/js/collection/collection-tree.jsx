'use strict';

import React from 'react';
import { Link } from 'react-router';
import Spinner from '../app/spinner';

export default class CollectionTree extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collections: this.props.collections.filter(c => c.nestingDepth === 1)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			collections: nextProps.collections.filter(c => c.nestingDepth === 1)
		});
	}

	renderCollections(collections, level) {
		let topLevelKeys = collections.map(col => col.key);
		let hasOpen = topLevelKeys.some(topLevelKey => this.props.path.includes(topLevelKey));
		return (
			<div className={ `level level-${level} ${hasOpen ? 'has-open' : ''}` }>
				<ul className="nav">
					{ collections.map(collection => {
						var openClass;
						switch(this.props.path.indexOf(collection.key)) {
							case -1:
								openClass = '';
							break;
							case (this.props.path.length - 1):
								openClass = 'selected';
							break;
							default: 
								openClass = 'open';
							break;
						}
						return (
							<li key={collection.key} className={ openClass }>
								<div className="item-container">
									{/* Button component */}
									<button type="button" className="twisty hidden-sm-down hidden-touch"/>
									<Link to={ `/collection/${collection.key}` }>
										{ collection.apiObj.data.name }
									</Link>
								</div>
								{ collection.children.length ? this.renderCollections(collection.children, level + 1) : null }
							</li>
						);
					}) }
				</ul>
			</div>
		);
	}

	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<nav className="collection-tree">
					<header className="touch-header hidden-mouse-md-up hidden-xs-down">
						<h3>Library</h3>
					</header>

					<div className="scroll-container">
						<section>
							<h4>My Library</h4>
							{ this.renderCollections(this.state.collections, 1)}
						</section>

						<section>
							<h4>Group Libraries</h4>
							{/* List of group libraries */}
						</section>
					</div>
				</nav>
			);
		}
	}
}

CollectionTree.propTypes = {
	isFetching: React.PropTypes.bool,
	onCollectionSelected: React.PropTypes.func.isRequired,
	collections: React.PropTypes.arrayOf(React.PropTypes.shape({
		key: React.PropTypes.string.isRequired,
		nestingDepth: React.PropTypes.integer,
		hasChildren: React.PropTypes.bool,
		children: React.PropTypes.array,
		apiObj: React.PropTypes.shape({
			data: React.PropTypes.shape({
				name: React.PropTypes.string
			})
		})
	})).isRequired,
	path: React.PropTypes.arrayOf(React.PropTypes.string)
};

CollectionTree.defaultProps = {
	isFetching: false,
	path: [],
	onCollectionSelected: () => null
};