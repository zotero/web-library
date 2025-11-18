
const clickEditBtn = async (page) => {
    const editBtn = page.getByRole('button', { name: 'Edit' });
    await editBtn.click();
};
export const fixtures = [
    [`groups/5119976/animals/items/X9WEHDAN/item-list`, 'desktop-test-group-item-view'],
    [`testuser/collections/5PB9WKTC/items/MNRM7HER/collection`, 'desktop-test-user-formatting-collection'],
    [`testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`, 'desktop-test-user-item-view'],
    [`testuser`, 'desktop-test-user-library-view'],
    [`testuser/collections/CSB4KZUU/items/BLVYJQMH/note/GNVWD3U4/item-details`, 'desktop-test-user-note-view'],
    [`testuser/items/KBFTPTI4/reader`, 'desktop-test-user-reader-parent-item-view'],
    [`testuser/items/KBFTPTI4/attachment/N2PJUHD6/reader`, 'desktop-test-user-reader-view'],
    [`testuser/search/retriever/titleCreatorYear/items/KBFTPTI4/item-list`, 'desktop-test-user-search-phrase-selected'],
    [`testuser/tags/to%20read/search/pathfinding/titleCreatorYear/items/J489T6X3,3JCLFUG4/item-list`, 'desktop-test-user-search-selected'],
    [`testuser/collections/CSB4KZUU/items/3JCLFUG4/attachment/K24TUDDL/item-details`, 'desktop-test-user-pdf-attachment-view-in-collection-view'],
    [`testuser/collections/CSB4KZUU/items/3JCLFUG4/attachment/37V7V4NT/item-details`, 'desktop-test-user-attachment-in-collection-view'],
    [`testuser/trash`, 'desktop-test-user-trash-view'],
    [`testuser/collections/CSB4KZUU/items/UMPPCXU4`, 'desktop-test-user-top-level-attachment-view'],
    [`testuser/collections/CSB4KZUU/items/ZKT5WURW`, 'desktop-test-user-top-level-attachment-view-2'],
    [`testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`, 'mobile-test-user-item-details-view'],
    [`testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`, 'mobile-test-user-item-details-view-edit', clickEditBtn],
    [`testuser/collections/WTTJ2J56/item-list`, 'mobile-test-user-item-list-view'],
    [`testuser/trash/items/Z7B4P73I/item-details`, 'mobile-test-user-trash-collection-details-view'],
];

export const fixturePathLookup = new Map(
    fixtures.map(([path, name]) => [name, path])
);
export const pathFixtureLookup = new Map(
    fixtures.map(([path, name]) => [path, name])
);