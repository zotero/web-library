'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

class TagSelector extends React.Component {
	render() {
		return (
			<div className="tag-selector">
				<div className="tag-selector-container">
					<ul className="tag-selector-list">
					{
						this.props.tags.map(tag => {
							let className = cx('tag-selector-item', {
								disabled: tag.disabled,
								selected: tag.selected,
								colored: tag.color
							});
							let props = {
								className,
								key: tag.name,
								onClick: ev => this.props.onSelection(tag, ev),
								onContextMenu: ev => this.props.onTagContext(tag, ev)
							};

							if(tag.color) {
								props['style'] = { color: tag.color };
							}

							return (
								<li key={ tag.name } { ...props }>
									{ tag.name }
								</li>
							);
						})
					}
					</ul>
				</div>
				<div className="tag-selector-filter-container">
					<input
						type="search"
						value={this.props.searchString}
						onChange={ ev => this.props.onSearch(ev.target.value) }
						className="tag-selector-filter" />
					<button className="tag-selector-actions" onClick={ ev => this.props.onSettings(ev) } />
				</div>
			</div>
		);
	}
}

TagSelector.propTypes = {
	tags: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		selected: PropTypes.bool,
		color: PropTypes.string,
		disabled: PropTypes.bool
	})),
	searchString: PropTypes.string,
	shouldFocus: PropTypes.bool,
	onSelection: PropTypes.func,
	onTagContext: PropTypes.func,
	onSearch: PropTypes.func,
	onSettings: PropTypes.func
};

TagSelector.defaultProps = {
	tags: [],
	searchString: '',
	shouldFocus: false,
	onSelection: () => Promise.resolve(),
	onTagContext: () => Promise.resolve(),
	onSearch: () => Promise.resolve(),
	onSettings: () => Promise.resolve()
};

module.exports = TagSelector;
