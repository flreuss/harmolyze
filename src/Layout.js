import React, { useRef } from "react";
import { Layout, useLayoutNavigation } from "react-md";
import { useLocation, Link, Switch, Route } from "react-router-dom";
import { ENTER, useCrossFade } from "@react-md/transition";

import Notation from "./Notation";
import Home from "./Home";

export default function MyLayout(props) {
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
      treeProps={useLayoutNavigation(props.navItems, pathname, Link)}
      mainProps={transitionProps}
      
    >
      <Switch>
      <Route 
        path="/exercise/:tuneId"
        component={
          routeProps => <Notation {...routeProps} initialAbcString={props.tuneBook.getTuneById(+routeProps.match.params.tuneId).abc} solutionAbcString={props.tuneBook.getTuneById(+routeProps.match.params.tuneId).abc}/>} />
        <Route path="/" component={Home} />
      </Switch>
    </Layout>
  );
}