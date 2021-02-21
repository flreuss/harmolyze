import { ReactNode } from "react";
import { HomeSVGIcon, TvSVGIcon } from "react-md";

/**
 * Note: The `parentId` **must** be defaulted to `null` for the navigation tree
 * to render correctly since this uses the @react-md/tree package behind the
 * scenes. Each item that has a `parentId` set to `null` will appear at the root
 * level of your navigation tree.
 */
function createRoute(pathname, children, leftAddon, parentId = null) {
    return {
        itemId: pathname,
        parentId: parentId,
        to: pathname,
        children: children,
        leftAddon: leftAddon,
    };
}

const navItems = {
    "/": createRoute("/", "Home", <HomeSVGIcon />),
    "/exercise": createRoute("/exercise", "Des Goldschmieds Töchterlein", <TvSVGIcon />),
};

export default navItems;