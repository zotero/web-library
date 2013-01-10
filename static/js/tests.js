

test('itemInit', function(){


    var itemsResponseObject = J(singleItemFeed);
    var itemfeed = Zotero.ajax.parseXmlFeed(singleItemFeed);
    fel = itemsResponseObject.find("feed");
    var item = new Zotero.Item();// Object.create(Zotero.item);
    item.parseXmlItem(J(this));
    console.log(item);

});

