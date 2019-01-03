import "core-js/modules/es6.array.find"; // Needed for IE 11
import "core-js/modules/es6.promise"; // Needed for IE 11
import "core-js/modules/es6.string.from-code-point"; // Needed for IE 11
import "core-js/modules/es7.array.includes"; // Needed for IE 11
import "core-js/modules/es7.object.values"; // Needed for IE 11

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
