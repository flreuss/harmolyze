import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Configuration } from 'react-md';
import abc from 'abcjs';

import Layout from './Layout';

import NavItems from "./navItems";
import tuneBookString from './tuneBookString';

import './react-md.scss';
import './index.css';

 // the ConfigurationProps are just all the props for the providers
 // joined together. The only difference is that onResize has been
 // renamed to onAppResize for the AppSizeListener
 const overrides = {
  // your configuration overrides
};

  const tuneBook = new abc.TuneBook(tuneBookString);
  const navit = NavItems.fromTuneBook(tuneBook);

ReactDOM.render(
  <BrowserRouter>
  <Configuration {...overrides}>
      <Layout tuneBook={tuneBook} navItems={navit}/>
    </Configuration>
  </BrowserRouter>,
    document.getElementById('root')
  );
