const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const { gaussianRandom } = require('../../utils');
const PAGE_SIZE = 30;
const PIXEL_BUFFER = 100;

class TagList extends React.PureComponent {
	componentDidMount() {
		this.handleMaybeLoadMore(0);
	}
	handleScroll(el) {
		this.handleMaybeLoadMore(el.target.scrollTop);
	}
	componentDidUpdate({ searchString: prevSearchString }) {
		if(this.props.searchString != prevSearchString) {
			this.handleMaybeLoadMore(this.container.scrollTop);
		}
	}

	async handleMaybeLoadMore(scrollTop) {
		if(this.isBusy) { return; }
		const { tags, totalTagCount, sourceTagsCount } = this.props;

		if(totalTagCount > tags.length && scrollTop + PIXEL_BUFFER > this.firstPlaceholderOffsetTop) {
			const start = sourceTagsCount;
			const limit = PAGE_SIZE;
			this.isBusy = true;
			await this.props.onLoadMore(start, limit);
			this.isBusy = false;
			this.handleMaybeLoadMore(this.container.scrollTop);
		}
	}

	refFirstPlaceholder(el) {
		if(el) {
			this.firstPlaceholderOffsetTop = el.offsetTop;
		}
	}

	renderTag(index) {
		const { tags } = this.props;
		const tag = index < tags.length ?
			tags[index] : {
				tag: "",
				isPlaceholder: true
			};

		const className = cx('tag-selector-item', {
			disabled: tag.disabled,
			selected: tag.selected,
			colored: tag.color,
			placeholder: tag.isPlaceholder
		});

		let props = {
			className,
			onClick: ev => this.props.onSelect(tag.tag, ev),
			onContextMenu: ev => this.props.onTagContext(tag, ev),
			ref: index == tags.length ? this.refFirstPlaceholder.bind(this) : undefined,
		};

		if(tag.color || tag.isPlaceholder) {
			props['style'] = {
				color: tag.color,
				// to achieve realistic-looking placeholders we use gaussian function
				// to pick length of a placeholder (in characters), then multiply by
				// semi-accurate 7px per character to get actual width in pixels
				width: tag.isPlaceholder ? gaussianRandom(5, 17) * 7 : undefined
			};
		}


		return (
			<li key={ index } { ...props }>
				{ tag.tag }
			</li>
		);
	}

	render() {
		const { totalTagCount } = this.props;
		this.firstPlaceholderOffsetTop = 0;
		return (
			<div
				className="tag-selector-container"
				onScroll={ this.handleScroll.bind(this) }
				ref={ ref => { this.container = ref } }>
				<ul className="tag-selector-list">
					{
						[...Array(totalTagCount).keys()].map(index => this.renderTag(index))
					}
				</ul>
			</div>
		)

	}
}

module.exports = TagList;
