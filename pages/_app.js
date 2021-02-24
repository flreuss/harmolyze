import React from 'react';
import abc from 'abcjs';

import '../styles/globals.css';

// import NavItems from "../lib/navItems";
import tuneBookString from '../lib/tuneBookString';

function MyApp({ Component, pageProps }) {
    const tuneBook = new abc.TuneBook(tuneBookString);
    // const navItems = NavItems.fromTuneBook(tuneBook);

      return (       
          <Component {...pageProps} tuneBook={tuneBook} />
        
          
  );
}

export default MyApp
