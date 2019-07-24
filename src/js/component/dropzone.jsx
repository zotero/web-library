'use strict'

'use strict';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Dropzone = ({ onFilesDrop }) => {
	const [filesOver, setFilesOver] = useState(0);

	const handleDrop = ev => {
		setFilesOver(0);
		onFilesDrop(Array.from(ev.dataTransfer.files));
	}
	const handleDragOver = ev => {
		setFilesOver(
			Array.from(ev.dataTransfer.items)
			.filter(i => i.kind === 'file').length
		);
	}
	const handleDragLeave = () => {
		setFilesOver(0);
	}

	return (
		<div
			className={ cx('dropzone', { filesOver: filesOver > 0 })}
			onDrop={ handleDrop }
			onDragOver={ handleDragOver }
			onDragLeave={ handleDragLeave }
		>
			<span>
				{ filesOver > 0  ? `Add ${filesOver} files` : "Drag files here" }
			</span>
		</div>
	);
}

Dropzone.propTypes = {
	onFilesDrop: PropTypes.func.isRequired
}

export default Dropzone;
