import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from 'react-window';
import cx from 'classnames';
import { useDebounce } from "use-debounce";

import { useSourceSignature, useTags } from '../../hooks';
import { checkColoredTags, fetchTags } from '../../actions';
import Spinner from '../ui/spinner';

const ROWHEIGHT = 43;
const PAGESIZE = 100;

const TouchTagListRow = props => {
	const { data, index, style } = props;
	const { tags, toggleTag } = data;
	const tag = tags[index];

	const className = cx({
		tag: true,
		odd: (index + 1) % 2 === 1,
		placeholder: !tag
	});

	const handleClick =  useCallback(() => toggleTag(tag.tag));

	return (
		<li
			style={ style }
			className={ className }
			onClick={ tag && handleClick }
		>
			<div className="tag-color" style={ tag && (tag.color && { color: tag.color }) } />
			<div className="truncate">{ tag && tag.tag }</div>
		</li>
	);
}

const TouchTagList = props => {
	const { toggleTag } = props;
	const dispatch = useDispatch();
	const loader = useRef(null);

	const { duplicatesCount, hasMoreItems, isFetching, pointer, requests, tags, totalResults, selectedTags, hasChecked } = useTags(true);
	const tagsSearchString = useSelector(state => state.current.tagsSearchString);
	const isFiltering = tagsSearchString !== '';
	const selectedTagsCount = selectedTags.length;
	const sourceSignature = useSourceSignature();

	const [isBusy] = useDebounce(!hasChecked || (isFetching && isFiltering), 100);

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
			dispatch(fetchTags(0, PAGESIZE - 1));
			dispatch(checkColoredTags());
		}
	}, [sourceSignature]);

	useEffect(() => {
		if(isFiltering && !isFetching && hasMoreItems) {
			dispatch(fetchTags(pointer, pointer + PAGESIZE - 1));
		}
	}, [isFiltering, isFetching, hasMoreItems]);

	return (
		<div className="scroll-container">
			<AutoSizer>
			{({ height, width }) => (
				<InfiniteLoader
					ref={ loader }
					isItemLoaded={ handleIsItemLoaded }
					itemCount={ isFiltering ? tags.length : totalResults }
					loadMoreItems={ handleLoadMore }
				>
					{({ onItemsRendered, ref }) => (
						<List
							className="tag-selector-list"
							height={ height }
							itemCount={ isFiltering ? tags.length : hasChecked ? totalResults - duplicatesCount - selectedTagsCount : 0 }
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
		{ isBusy && <Spinner className="large centered" /> }
		</div>
	);
}

export default TouchTagList;
