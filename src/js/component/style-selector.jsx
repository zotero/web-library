'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Select = require('./form/select');
const { citationStylesCount } = require('../../../data/citation-styles-data.json');

class StyleSelector extends React.PureComponent {
	render() {
		const { className, citationStyle, citationStyles,
			onStyleChange } = this.props;
		return (
			<div className={ cx('style-selector', className ) }>
				<Select
					clearable={ false }
					searchable={ false}
					value={ citationStyle }
					options={ [
						...citationStyles.map(cs => ({
							value: cs.name,
							label: cs.title
						})),
						{
							value: 'install',
							label: `${(Math.floor(citationStylesCount / 100) * 100).toLocaleString()}+ other styles available…`
						}
					] }
					onChange={ () => true /* commit on change */ }
					onCommit={ onStyleChange }
				/>
			</div>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		citationStyle: PropTypes.string,
		citationStyles: PropTypes.array,
		onStyleChange: PropTypes.func
	}
}


module.exports = StyleSelector;
