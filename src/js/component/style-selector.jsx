'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Select = require('./form/select');
const { citationStylesCount } = require('../../../data/citation-styles-data.json');

class StyleSelector extends React.Component {
	render() {
		return (
			<div className={ cx('style-selector', this.props.className ) }>
				<Select
					clearable={ false }
					searchable={ false}
					value={ this.props.citationStyle }
					options={ [
						...this.props.citationStyles.map(cs => ({
							value: cs.name,
							label: cs.title
						})),
						{
							value: 'install',
							label: `${(Math.floor(citationStylesCount / 100) * 100).toLocaleString()}+ other styles available…`
						}
					] }
					onChange={ () => true /* commit on change */ }
					onCommit={ this.props.onCitationStyleChanged }
				/>
			</div>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		citationStyle: PropTypes.string,
		citationStyles: PropTypes.array,
		onCitationStyleChanged: PropTypes.func
	}
}


module.exports = StyleSelector;
