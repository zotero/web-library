import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';
import cx from 'classnames';

import { useTags } from '../../hooks';
import { checkColoredTags, fetchTags } from '../../actions';

const ROWHEIGHT = 43;

const TouchTagListRow = props => {
	const { data, index, style } = props;
	const { tags } = data;
	const tag = tags[index];

	const className = cx({
		tag: true,
		odd: (index + 1) % 2 === 1,
		placeholder: tag === null
	});

	return (
		<li style={ style } className={ className } >
			{ tag && (
				<React.Fragment>
				<div className="tag-color" style={ tag.color && { color: tag.color } } />
				<div className="truncate">{ tag.tag }</div>
				</React.Fragment>
			) }
		</li>
	);
}

const TouchTagList = props => {
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { isFetching, requests, tags, totalResults, hasChecked } = useTags(true);

	const handleIsItemLoaded = useCallback(index => {
		if(tags && !!tags[index]) {
			return true; // loaded
		}
		return requests.some(r => index >= r[0] && index < r[1]); // loading
	});

	const handleLoadMore = useCallback((startIndex, stopIndex) => {
		dispatch(fetchTags(startIndex, stopIndex));
	});

	useEffect(() => {
		console.log({ hasChecked, isFetching });
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, 49));
			dispatch(checkColoredTags());
		}
	}, []);

	return (
		<AutoSizer>
		{({ height, width }) => (
			<InfiniteLoader
				ref={ loader }
				isItemLoaded={ handleIsItemLoaded }
				itemCount={ totalResults }
				loadMoreItems={ handleLoadMore }
			>
				{({ onItemsRendered, ref }) => (
					<List
						className="tag-selector-list"
						height={ height }
						itemCount={ hasChecked ? totalResults : 0 }
						itemData={ { tags } }
						itemSize={ ROWHEIGHT }
						onItemsRendered={ onItemsRendered }
						ref={ ref }
						width={ width }
					>
						{ TouchTagListRow }
					</List>
				)}
			</InfiniteLoader>
		)}
		</AutoSizer>
	);
}

export default TouchTagList;