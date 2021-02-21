import { HomeSVGIcon, MusicNoteSVGIcon } from "react-md";

class NavItems {
    /**
 * Note: The `parentId` **must** be defaulted to `null` for the navigation tree
 * to render correctly since this uses the @react-md/tree package behind the
 * scenes. Each item that has a `parentId` set to `null` will appear at the root
 * level of your navigation tree.
 */
static createRoute(pathname, children, leftAddon, parentId = null) {
    return {
        children: children,
        itemId: pathname,
        leftAddon: leftAddon,
        parentId: parentId,
        to: pathname,
    };
}

static fromTuneBook(tuneBook){
    let navItems = {
        "/": this.createRoute("/", "Home", <HomeSVGIcon />),
    };

    for(const tune of tuneBook.tunes){
        const tunePathName = "/exercise/" + tune.id;
        navItems[tunePathName] = this.createRoute(tunePathName, tune.title, <MusicNoteSVGIcon />);
    }

    return navItems;
}
}

export default NavItems;