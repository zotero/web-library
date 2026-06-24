import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Icon, Popover, PopoverBody, PopoverDialog, PopoverTrigger, ProgressRing, Spinner } from 'web-common/components';

import { useFulltextStatus } from '../hooks';

const FulltextReindexingProgress = () => {
	const { isActive, isReindexing, isRefreshing, isComplete, indexedCount, expectedCount, dismiss } = useFulltextStatus();

	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef(null);
	const wasIndexingRef = useRef(false);
	const wasCompleteRef = useRef(false);

	// Auto-open the popover when a reindexing starts or when it fully completes.
	// The intermediate refreshing (spinner) stage leaves the popover as it was.
	useEffect(() => {
		const startedIndexing = isReindexing && !wasIndexingRef.current;
		const finishedIndexing = isComplete && !wasCompleteRef.current;
		wasIndexingRef.current = isReindexing;
		wasCompleteRef.current = isComplete;
		// Only the visible indicator opens its popover; a CSS-hidden instance
		// (display:none, so offsetParent is null) must stay closed.
		const isVisible = triggerRef.current && triggerRef.current.offsetParent !== null;
		if((startedIndexing || finishedIndexing) && isVisible) {
			setIsOpen(true);
		}
	}, [isReindexing, isComplete]);

	// Closing the popover (trigger, outside click or Escape) dismisses a completed
	// indicator; while a rebuild is in progress, `dismiss` is a no-op.
	const handleToggle = useCallback(() => {
		if(isOpen) {
			dismiss();
		}
		setIsOpen(open => !open);
	}, [isOpen, dismiss]);

	const handleClose = useCallback(() => {
		dismiss();
		setIsOpen(false);
	}, [dismiss]);

	if(!isActive) {
		return null;
	}

	const title = isComplete ? "Full-text index rebuilt" : "Rebuilding full-text index";
	// Counts are null until the first status poll lands; omit them entirely until then
	// rather than showing a placeholder "(0/0)".
	const hasCounts = Number.isFinite(indexedCount) && Number.isFinite(expectedCount);
	const counts = hasCounts ? ` (${indexedCount.toLocaleString()}/${expectedCount.toLocaleString()})` : "";
	let bodyText;
	if(isComplete) {
		bodyText = "Full-text search is up to date.";
	} else if(isRefreshing) {
		bodyText = "Running full-text search…";
	} else {
		bodyText = `Preparing full-text search${counts}`;
	}

	let progressIcon;
	if(isComplete) {
		progressIcon = <Icon type="16/tick" width="16" height="16" />;
	} else if(isRefreshing) {
		progressIcon = <Spinner />;
	} else {
		progressIcon = <ProgressRing value={ indexedCount } max={ expectedCount } />;
	}

	// While rebuilding or refreshing, the popover is sticky: outside clicks and Escape are
	// ignored, so only the X button or the trigger close it. Once complete, it dismisses normally.
	return (
		<Popover
			isOpen={ isOpen }
			onToggle={ handleToggle }
			placement="bottom"
			offset={ 2 }
			strategy="fixed"
			portal={ true }
			autoFocus={ false }
			dismissOnOutsideClick={ isComplete }
			dismissOnEscape={ isComplete }
		>
			{ /* aria-label is explicit because the progress indicator child is a
			     progressbar whose value would otherwise become the trigger's
			     accessible name. */ }
			<PopoverTrigger
				ref={ triggerRef }
				aria-label={ title }
				className="fulltext-reindexing-progress"
				icon
				tabIndex={ -2 }
				title={ title }
			>
				{ progressIcon }
			</PopoverTrigger>
			<PopoverDialog aria-label={ title } className="fulltext-reindexing-popover">
				<Button
					icon
					className="close"
					onClick={ handleClose }
					aria-label="Close"
				>
					<Icon type={ '10/x' } width="10" height="10" />
				</Button>
				<PopoverBody>
					{ bodyText }
				</PopoverBody>
			</PopoverDialog>
		</Popover>
	);
};

FulltextReindexingProgress.displayName = 'FulltextReindexingProgress';

export default memo(FulltextReindexingProgress);
