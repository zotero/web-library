'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { noop } = require('../../../utils');
const Icon = require('../../ui/icon');
const Dropdown = require('reactstrap/lib/Dropdown').default;
const DropdownToggle = require('reactstrap/lib/DropdownToggle').default;
const DropdownMenu = require('reactstrap/lib/DropdownMenu').default;
const DropdownItem = require('reactstrap/lib/DropdownItem').default;

const exportFormats = [
	{ key: 'bibtex', label: 'BibTeX' },
	{ key: 'biblatex', label: 'BibLaTeX' },
	{ key: 'bookmarks', label: 'Netscape Bookmark File Format' },
	{ key: 'coins', label: 'COinS' },
	{ key: 'csljson', label: 'Citation Style Language data format' },
	{ key: 'mods', label: 'MODS' },
	{ key: 'refer', label: 'Refer/BibIX' },
	{ key: 'rdf_bibliontology', label: 'Bibliographic Ontology RDF' },
	{ key: 'rdf_dc', label: 'Unqualified Dublin Core RDF' },
	{ key: 'rdf_zotero', label: 'Zotero RDF' },
	{ key: 'ris', label: 'RIS' },
	{ key: 'tei', label: 'Text Encoding Initiative (TEI)' },
	{ key: 'wikipedia', label: 'Wikipedia Citation Templates ' },
];

class ExportActions extends React.PureComponent {
	state = {
		isOpen: false,
	}

	handleToggleDropdown() {
		this.setState({ isOpen: !this.state.isOpen });
	}

	handleSelect(format) {
		this.props.onExport(format);
	}

	renderItemType(exportFormat) {
		return (
			<DropdownItem
				key={ exportFormat.key }
				onClick={ this.handleSelect.bind(this, exportFormat.key) }
			>
				{ exportFormat.label }
			</DropdownItem>
		);
	}

	render() {
		return (
			<Dropdown
				isOpen={ this.state.isOpen }
				toggle={ this.handleToggleDropdown.bind(this) }
				className="dropdown-wrapper new-item-selector"
			>
				<DropdownToggle
					color={ null }
					disabled={ this.props.selectedItemKeys.length == 0 }
					className="btn-icon dropdown-folder"
				>
					<Icon type={ '16/cog' } width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu>
					{
						exportFormats.map(exportFormat => this.renderItemType(exportFormat))
					}
				</DropdownMenu>
			</Dropdown>
		);
	}

	static defaultProps = {
		onExport: noop,
	}

	static propTypes = {
		onExport: PropTypes.func,
		selectedItemKeys: PropTypes.array,
	}
}

module.exports = ExportActions;
