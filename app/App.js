import { Component } from 'react';

import CookieKitPopup from './component/CookieKitPopup';

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      position: 'bottom-left',
      isAuthorized: false,
      isOffline: false
    };
  }

  render() {
    const { isOpen, position, isAuthorized, isOffline } = this.state;

    return <div className={`container ${position}`}>
      { isOpen ?
        <CookieKitPopup onClose={() => this.setState({ isOpen: false })}
                        isAuthorized={isAuthorized}
                        isOffline={isOffline}/> :
        <img src="cookie.svg" className="cookie-icon" onClick={() => this.setState({ isOpen: true })}/> }
    </div>;
  }
}
