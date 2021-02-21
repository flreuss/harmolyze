import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import { Configuration } from 'react-md';
import './index.css';
import Layout from "./Layout";

 // the ConfigurationProps are just all the props for the providers
 // joined together. The only difference is that onResize has been
 // renamed to onAppResize for the AppSizeListener
 const overrides = {
  // your configuration overrides
};

ReactDOM.render(
  <BrowserRouter>
  <Configuration {...overrides}>
      <Layout />
    </Configuration>
  </BrowserRouter>,
    document.getElementById('root')
  );
