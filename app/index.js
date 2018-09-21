import ReactDOM from 'react-dom';

import './style/main.scss';

import { App } from './App';

const CONTAINER = document.createElement('div');

CONTAINER.id = 'xcoobee-cookie-kit';
ReactDOM.render(<App />, CONTAINER);
document.body.appendChild(CONTAINER);
