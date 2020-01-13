import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';
import cx from 'classnames';

import { useSourceSignature, useTags } from '../../hooks';
import { checkColoredTags, fetchTags } from '../../actions';
import Spinner from '../ui/spinner';

const ROWHEIGHT = 43;

const TouchTagListRow = props => {
	const { data, index, style } = props;
	const { tags, toggleTag } = data;
	const tag = tags[index];

	const className = cx({
		tag: true,
		odd: (index + 1) % 2 === 1,
		placeholder: tag === null
	});

	const handleClick =  useCallback(() => toggleTag(tag.tag));

	return (
		<li
			style={ style }
			className={ className }
			onClick={ handleClick }
		>
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
	const { toggleTag } = props;
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { isFetching, requests, tags, totalResults, hasChecked } = useTags(true);
	const sourceSignature = useSourceSignature();

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
		if(!hasChecked && !isFetching) {
			dispatch(fetchTags(0, 49));
			dispatch(checkColoredTags());
		}
	}, [sourceSignature]);

	return (
		<div className="scroll-container">
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
							itemData={ { tags, toggleTag } }
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
		{ !hasChecked && <Spinner className="large" /> }
		</div>
	);
}

export default TouchTagList;
