import React from 'react';
import { useSelector } from 'react-redux';
import AttachmentDetails from '../component/item-details/attachment-details';
import cx from 'classnames';
import { useEditMode } from '../hooks';

const TouchAttachment = () => {
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const [isEditing, ] = useEditMode();

	const className = cx({
		'editing': isEditing,
		'hidden-mouse': true,
		'touch-attachment': true,
		'touch-details-drilldown': true,
	});

	return (
		<section className={ className }>
			{ attachmentKey && (
				<AttachmentDetails
					isReadOnly={ !isEditing }
					attachmentKey={ attachmentKey }
				/>
			)}
		</section>
	);
}


export default TouchAttachment;
