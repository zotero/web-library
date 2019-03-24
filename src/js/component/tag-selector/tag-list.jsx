import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
const PAGE_SIZE = 100;

class TagList extends React.PureComponent {
	componentDidMount() {
		const { onLoadMore } = this.props;
		onLoadMore(0, PAGE_SIZE);
	}

	maybeLoadMore() {
		const { isFetching, sourceTags, totalTagCount, onLoadMore } = this.props;
		const containerHeight = this.containerRef.getBoundingClientRect().height;
		const totalHeight = this.listRef.getBoundingClientRect().height;
		const scrollProgress = (this.containerRef.scrollTop + containerHeight) / totalHeight;

		if(scrollProgress > 0.5 && !isFetching && totalTagCount > sourceTags.length) {
			onLoadMore(sourceTags.length, PAGE_SIZE);
		}
	}

	renderTag(tag) {
		const className = cx('tag-selector-item', {
			disabled: tag.disabled,
			selected: tag.selected,
			colored: tag.color,
			placeholder: tag.isPlaceholder
		});

		const props = {
			className,
			style: tag.color && { color: tag.color },
			onClick: ev => this.props.onSelect(tag.tag, ev),
		};

		return (
			<li key={ tag.tag } { ...props }>
				{ tag.tag }
			</li>
		);
	}

	render() {
		const { tags } = this.props;

		return (
			<div
				ref={ containerRef => this.containerRef = containerRef }
				onScroll={ () => this.maybeLoadMore() }
				className="tag-selector-container"
			>
				<ul
					ref={ listRef => this.listRef = listRef }
					className="tag-selector-list"
				>
					{ tags.map(this.renderTag.bind(this)) }
				</ul>
			</div>
		)

	}
}

export default TagList;
