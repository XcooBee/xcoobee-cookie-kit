import React, { Component } from 'react';
import CookieKit from 'xcoobee-cookie-kit-react';

import logo from './logo.svg';

import 'xcoobee-cookie-kit-react/dist/xck-react.css';
import './App.css';

class App extends Component {
  onCookieConsentsChange = (cookieConsents) => {
    console.log('App#onCookieConsentsChange');
    console.dir(cookieConsents);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <CookieKit
          cssAutoLoad={false}
          cookieHandler={this.onCookieConsentsChange}
          privacyUrl="https://google.com/privacy"
          requestDataTypes={['advertising', 'application', 'statistics', 'usage']}
          termsUrl="https://google.com/terms"
          textMessage={{
            "de-de": "Die Beschreibung.",
            "en-us": "The description.",
            "es-419": "La descripción.",
            "fr-fr": "La description.",
          }}
        />
      </div>
    );
  }
}

export default App;
