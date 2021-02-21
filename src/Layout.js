import React, { useRef } from "react";
import { Layout, useLayoutNavigation } from "react-md";
import { useLocation, Link, Switch, Route } from "react-router-dom";
import { ENTER, useCrossFade } from "@react-md/transition";

import navItems from "./navItems";
import App from "./App";
import App2 from "./App2";

export default function MyLayout() {
  const { pathname } = useLocation();

  const [_rendered, transitionProps, dispatch] = useCrossFade();
  
    const prevPathname = useRef(pathname);
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      dispatch(ENTER);
    }


  return (
    <Layout
      title="Riemann App"
      navHeaderTitle="Exercises"
      treeProps={useLayoutNavigation(navItems, pathname, Link)}
      mainProps={transitionProps}
    >
      <Switch>
        <Route path="/exercise" component={App} />
        <Route path="/" component={App2} />
      </Switch>
    </Layout>
  );
}