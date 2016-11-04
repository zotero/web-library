'use strict';

import React from 'react';

export default class TagSelector extends React.Component {
	render() {
		return (
			<div className="tag-selector">
				<div className="tag-selector-container">
					<ul className="tag-selector-list">
					{
						this.props.tags.map(tag => (
							<li 
								className={ tag.selected ? 'tag-selector-item selected' : 'tag-selector-item' }
								key={ tag.name }
								onClick={ () => this.props.onSelection(tag) }
							>
								{ tag.name }
							</li>
						))
					}
					</ul>
				</div>
				<div className="tag-selector-filter-container">
					<input className="tag-selector-filter" />
				</div>
			</div>
		);
	}
}

TagSelector.propTypes = {
	tags: React.PropTypes.arrayOf(React.PropTypes.shape({
		name: React.PropTypes.string,
		selected: React.PropTypes.bool
	})),
	searchString: React.PropTypes.string,
	shouldFocus: React.PropTypes.bool,
	onSelection: React.PropTypes.func
};

TagSelector.defaultProps = {
	tags: [],
	searchString: '',
	shouldFocus: false
};