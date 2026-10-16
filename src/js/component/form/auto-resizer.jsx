import cx from 'classnames';

const AutoResizer = props => {
	const { vertical, children, content } = props;
	return (
		<div className={ cx('auto-resizer', { vertical, horizontal: !vertical }) } >
			<div className="content">{ content }</div>
			{ children }
		</div>
	)
}

export default AutoResizer;
