'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:recentItems');

var React = require('react');

var RecentItems = React.createClass({
    componentWillMount: function() {
        var reactInstance = this;
        var library = reactInstance.props.library;
        reactInstance.setState({loading:true});
        library.loadItems({
            'limit': 10,
            'order': 'dateModified'
        }).then(function(response){
            reactInstance.setState({loading:false, items:response.loadedItems});
        });
    },
    getDefaultProps: function() {
        return {
            displayFields: ['title', 'creatorSummary', 'dateModified'],
            item: {}
        };
    },
    getInitialState: function() {
        return {
            loading:false,
            items:[]
        };
    },
    render: function() {
        var reactInstance = this;
        var itemRows = this.state.items.map(function(item){
            return (
                <RecentItemRow key={item.get('key')} item={item} />
            );
        });

        var headers = this.props.displayFields.map(function(header){
            return (
                <th key={header} className="field-table-header">
                    {Zotero.Item.prototype.fieldMap[header] ? Zotero.Item.prototype.fieldMap[header] : header}
                </th>
            );
        });

        return (
            <table id='field-table' ref="itemsTable" className='wide-items-table table table-striped'>
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
            </table>
        );
    }
});

var RecentItemRow = React.createClass({
    getDefaultProps: function() {
        return {
            displayFields: ['title', 'creatorSummary', 'dateModified'],
            item: {}
        };
    },
    render: function() {
        var reactInstance = this;
        var item = this.props.item;
        var fields = this.props.displayFields.map(function(field){
            return (
                <td key={field} className={field} data-itemkey={item.get('key')}>
                    <a data-itemkey={item.get('key')} href={Zotero.url.itemHref(item)} title={item.get(field)}>
                        {Zotero.format.itemField(field, item, true)}
                    </a>
                </td>
            );
        });
        return (
            <tr>
                {fields}
            </tr>
        );
    }
});

module.exports = RecentItems;
