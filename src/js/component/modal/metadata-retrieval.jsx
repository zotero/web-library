import cx from 'classnames';
import PropTypes from 'prop-types';
import { Fragment, useCallback, memo, useEffect, useId } from 'react';
import { Button, Icon } from 'web-common/components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import { pick } from 'web-common/utils';

import Modal from '../ui/modal';
import { METADATA_RETRIEVAL } from '../../constants/modals';
import { currentRetrieveMetadata, toggleModal, navigate } from '../../actions';
import Table from '../common/table';
import List from '../common/list';
import { GenericDataCell, default as Cell } from '../common/table-cell';

const MetadataRetrievalListItem = props => {
	const { data, index, style, className } = props;
	const { getItemData } = data;
	const itemData = getItemData(index);
	const { parentItemTitle, title, iconName, } = itemData;
	const colorScheme = useSelector(state => state.preferences.colorScheme);

	return (
		<div
			className={cx('item', className, {
				odd: (index + 1) % 2 === 1
			})}
			style={style}
			role="listitem"
		>
			<Icon
				type={`28/item-type/attachment-pdf`}
				symbol="attachment-pdf"
				useColorScheme={true}
				colorScheme={colorScheme}
				width="28"
				height="28"
				className="item-type"
			/>
			<div className="flex-column">
				<div className="metadata title">
					{title}
				</div>
				<div className="metadata parent-item-title-container">
					<Icon
						type={`16/${iconName}`}
						symbol={iconName}
						color={iconName === 'tick' ? 'var(--accent-green)' : iconName === 'cross' ? 'var(--accent-red)' : 'var(--fill-secondary)'}
						width="16"
						height="16"
						className={cx('metadata-status-icon', { 'spin': iconName === 'refresh' })}
					/>
					<span className="parent-item-title">
						{parentItemTitle}
					</span>
				</div>
			</div>
		</div>
	);
}

MetadataRetrievalListItem.propTypes = {
	data: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	style: PropTypes.object.isRequired,
	className: PropTypes.string
};


const MetadataRetrievalTitleCell = memo(props => {
	const { columnName, itemData, labelledById } = props;
	const { title, iconName, } = itemData;
	return (
		<Cell
			columnName={columnName}
			{...pick(props, ['colIndex', 'width', 'isFirstColumn', 'isLastColumn'])}
		>
			<Icon
				className="metadata-status-icon"
				color={iconName === 'tick' ? 'var(--accent-green)' : iconName === 'cross' ? 'var(--accent-red)' : 'var(--fill-secondary)'}
				height="16"
				label={iconName === 'tick' ? 'Completed' : iconName === 'cross' ? 'Error' : 'Processing'}
				role="status"
				symbol={iconName}
				type={`16/${iconName}`}
				width="16"
			/>
			<div className="truncate" id={labelledById}>
				{title}
			</div>
		</Cell>
	);
});

MetadataRetrievalTitleCell.displayName = 'MetadataRetrievalTitleCell';

MetadataRetrievalTitleCell.propTypes = {
	columnName: PropTypes.string.isRequired,
	itemData: PropTypes.shape({
		title: PropTypes.string,
		iconName: PropTypes.string
	}).isRequired,
	labelledById: PropTypes.string,
	colIndex: PropTypes.number,
	width: PropTypes.string,
	isFirstColumn: PropTypes.bool,
	isLastColumn: PropTypes.bool
}

const MetadataRetrievalTableRow = memo(props => {
	const { data, index, style } = props;
	const id = useId();
	const labelledById = `${id}-title`;

	const { columns, getItemData } = data;
	const itemData = getItemData(index);

	return (
		<div
			aria-rowindex={index + 1}
			aria-labelledby={labelledById}
			className="item"
			style={style}
			data-index={index}
			role="row"
			tabIndex={-2}
		>
			{columns.map((c, colIndex) => c.field === "title" ? (
				<MetadataRetrievalTitleCell
					key={c.field}
					colIndex={colIndex}
					isFirstColumn={colIndex === 0}
					isLastColumn={colIndex === columns.length - 1}
					labelledById={labelledById}
					columnName={c.field}
					itemData={itemData}
					width={`var(--col-${colIndex}-width)`}
				/>
			) : (
				<GenericDataCell
					key={c.field}
					colIndex={colIndex}
					isFirstColumn={colIndex === 0}
					isLastColumn={colIndex === columns.length - 1}
					columnName={c.field}
					itemData={itemData}
					width={`var(--col-${colIndex}-width)`}
				/>
			))}
		</div>
	)
});

MetadataRetrievalTableRow.displayName = 'MetadataRetrievalTableRow';
MetadataRetrievalTableRow.propTypes = {
	data: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	style: PropTypes.object.isRequired
}


const MetadataRetrievalModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isOpen = useSelector(state => state.modal.id === METADATA_RETRIEVAL);
	const recognizeSelected = useSelector(state => state.modal?.recognizeSelected);
	const wasOpen = usePrevious(isOpen);
	const recognizeProgress = useSelector(state => state.recognize.progress);
	const backgroundTaskId = useSelector(state => state.recognize.backgroundTaskId);
	const recognizeEntries = useSelector(state => state.recognize.entries, shallowEqual);
	const isDone = recognizeProgress === 1;
	const columns = [
		{
			field: 'title',
			label: 'Attachment Name',
			fraction: 0.3,
			minFraction: 0.1,
			isSortable: false,
			isResizable: true
		},
		{
			field: 'parentItemTitle',
			label: 'Item Name',
			fraction: 0.7,
			minFraction: 0.1,
			isSortable: false,
			isResizable: true
		}
	];

	const getItemData = useCallback((index) => {
		const item = recognizeEntries[index] ?? {};
		const iconName = item.completed ? 'tick' : item.error ? 'cross' : 'refresh';

		return {
			title: item.itemTitle,
			parentItemTitle: item.completed ? item.parentItemTitle : item.error ? 'Error' : 'Processing',
			iconName,
			completed: item.completed,
			error: item.error
		}
	}, [recognizeEntries]);

	const handleCancel = useCallback(() => {
		if(isTouchOrSmall && !isDone) {
			return;
		}
		// if recognition is done, clear the modal and the recognition state when closing
		if ((isDone || recognizeEntries.length === 0) && backgroundTaskId) {
			dispatch({ type: 'CLEAR_ONGOING', id: backgroundTaskId });
		}
		dispatch(toggleModal());
	}, [backgroundTaskId, dispatch, isDone, isTouchOrSmall, recognizeEntries]);

	useEffect(() => {
		if (isOpen && !wasOpen) {
			if (backgroundTaskId) {
				dispatch({ type: 'UPDATE_ONGOING', id: backgroundTaskId, skipUI: true });
			}
			if (recognizeSelected) {
				dispatch(currentRetrieveMetadata());
				// unselect items to be recognized. If recognition is successful, the items will become child items and thus disappear from the list
				setTimeout(() => { dispatch(navigate({ items: [] })); }, 0);
			}
		} else if (!isOpen && wasOpen) {
			if (backgroundTaskId) {
				dispatch({ type: 'UPDATE_ONGOING', id: backgroundTaskId, skipUI: false });
			}
		}
	}, [backgroundTaskId, dispatch, isOpen, recognizeSelected, wasOpen]);

	const sharedProps = {
		columns, totalResults: recognizeEntries.length, itemCount: recognizeEntries.length, getItemData
	};

	return (
		<Modal
			className={"recognize-modal"}
			contentLabel="Metadata Retrieval"
			isOpen={isOpen}
			onRequestClose={handleCancel}
			overlayClassName={cx('modal-centered', { 'modal-slide': isTouchOrSmall })}
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<Fragment>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									Metadata Retrieval
								</h4>
							</div>
							<div className="modal-header-right">
								{ isDone && (
								<Button
									className="btn-link"
									onClick={handleCancel}
								>
									Close
								</Button>
								)}
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								Metadata Retrieval
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
								title="Close Dialog"
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</Fragment>
					)
				}
			</div>
			<div
				className="modal-body"
				tabIndex={!isTouchOrSmall ? 0 : null}
			>
				<div className="recognize-progress">
					<progress
						aria-label="Metadata retrieval progress"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={recognizeProgress * 100}
						value={recognizeProgress}
						max="1"
					/>
				</div>
				{isTouchOrSmall ? (
					<List
						containerClassName="recognize-list"
						rowComponent={MetadataRetrievalListItem}
						{...sharedProps}
					/>
				) : (
					<Table
						containerClassName="recognize-list"
						rowComponent={MetadataRetrievalTableRow}
						{...sharedProps}
					/>
				)}
			</div>
		</Modal>
	);
}

export default memo(MetadataRetrievalModal);
