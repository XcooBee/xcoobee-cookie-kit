import React, { Component } from 'react';
import CookieKit from 'xcoobee-cookie-kit-react';

import 'xcoobee-cookie-kit-react/dist/xck-react.css';

import './App.css';

import coffeeShopImg from "./assets/images/coffeeshop.jpg";
import coffeeHouse2Img from "./assets/images/coffeehouse2.jpg";

class App extends Component {
  onCookieConsentsChange = (cookieConsents) => {
    console.log('App#onCookieConsentsChange');
    console.dir(cookieConsents);
  }

  render() {
    return (
      <React.Fragment>
        {/* Links (sit on top) */}
        <div className="w3-top">
          <div className="w3-row w3-padding w3-black">
            <div className="w3-col s3">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="w3-button w3-block w3-black">HOME</a>
            </div>
            <div className="w3-col s3">
              <a href="#about" className="w3-button w3-block w3-black">ABOUT</a>
            </div>
            <div className="w3-col s3">
              <a href="#terms" className="w3-button w3-block w3-black">TERMS</a>
            </div>
            <div className="w3-col s3">
              <a href="#privacy" className="w3-button w3-block w3-black">PRIVACY</a>
            </div>
          </div>
        </div>

        {/* Header with image */}
        <header className="bgimg w3-display-container w3-grayscale-min" id="home">
          <div className="w3-display-bottomleft w3-center w3-padding-large w3-hide-small">
            <span className="w3-tag">Open from 6am to 5pm</span>
          </div>
          <div className="w3-display-middle w3-center">
            <span className="w3-text-white" style={{ "font-size": "90px" }}>the<br />Cafe</span>
          </div>
          <div className="w3-display-bottomright w3-center w3-padding-large">
            <span className="w3-text-white">15 Adr street, 5015</span>
          </div>
        </header>

        {/* Add a background color and large text to the whole page */}
        <div className="w3-sand w3-grayscale w3-large">

          {/* About Container */}
          <div className="w3-container" id="about">
            <div className="w3-content" style={{ "max-width": "700px" }}>
              <h5 className="w3-center w3-padding-64"><span className="w3-tag w3-wide">ABOUT THE CAFE</span></h5>
              <p>
                The Cafe was founded in blabla by Mr. Smith. This is a sample template from w3 schools we use to show the use of XcooBee Cookie Kit.
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                In addition to our full espresso and brew bar menu, we serve fresh made-to-order breakfast and lunch sandwiches, as well as a selection of sides and salads and other good stuff.
              </p>
              <div className="w3-panel w3-leftbar w3-light-grey">
                <p><i>"Use products from nature for what it's worth - but never too early, nor too late." Fresh is the new sweet.</i></p>
                <p>Chef, Coffeeist and Owner: Liam Brown</p>
              </div>
              <img alt="Coffee Shop" src={coffeeShopImg} style={{ width: "100%", "max-width": "1000px" }} className="w3-margin-top" />
              <p><strong>Opening hours:</strong> everyday from 6am to 5pm.</p>
              <p><strong>Address:</strong> 15 Adr street, 5015, NY</p>
            </div>
          </div>

          {/* Menu Container */}
          <div className="w3-container" id="menu">
            <div className="w3-content" style={{ "max-width": "700px" }}>
              <h5 className="w3-center w3-padding-48"><span className="w3-tag w3-wide">THE MENU</span></h5>
              <div className="w3-row w3-center w3-card w3-padding">
                {/* eslint-disable-next-line no-script-url, jsx-a11y/anchor-is-valid */}
                <a href="javascript:void(0)" onclick="openMenu(event, 'Eat');" id="myLink">
                  <div className="w3-col s6 tablink w3-dark-grey">Eat</div>
                </a>
                {/* eslint-disable-next-line no-script-url, jsx-a11y/anchor-is-valid */}
                <a href="javascript:void(0)" onclick="openMenu(event, 'Drinks');">
                  <div className="w3-col s6 tablink">Drink</div>
                </a>
              </div>

              <div id="Eat" className="w3-container menu w3-padding-48 w3-card" style={{ display: "block" }}>
                <h5>Bread Basket</h5>
                <p className="w3-text-grey">Assortment of fresh baked fruit breads and muffins 5.50</p><br />

                <h5>Honey Almond Granola with Fruits</h5>
                <p className="w3-text-grey">Natural cereal of honey toasted oats, raisins, almonds and dates 7.00</p><br />

                <h5>Belgian Waffle</h5>
                <p className="w3-text-grey">Vanilla flavored batter with malted flour 7.50</p><br />

                <h5>Scrambled eggs</h5>
                <p className="w3-text-grey">Scrambled eggs, roasted red pepper and garlic, with green onions 7.50</p><br />

                <h5>Blueberry Pancakes</h5>
                <p className="w3-text-grey">With syrup, butter and lots of berries 8.50</p>
              </div>

              <div id="Drinks" className="w3-container menu w3-padding-48 w3-card" style={{ display: "none" }}>
                <h5>Coffee</h5>
                <p className="w3-text-grey">Regular coffee 2.50</p><br />

                <h5>Chocolato</h5>
                <p className="w3-text-grey">Chocolate espresso with milk 4.50</p><br />

                <h5>Corretto</h5>
                <p className="w3-text-grey">Whiskey and coffee 5.00</p><br />

                <h5>Iced tea</h5>
                <p className="w3-text-grey">Hot tea, except not hot 3.00</p><br />

                <h5>Soda</h5>
                <p className="w3-text-grey">Coke, Sprite, Fanta, etc. 2.50</p>
              </div>
              <img alt="Coffee House" src={coffeeHouse2Img} style={{ width: "100%", "max-width": "1000px", "margin-top": "32px" }} />
            </div>
          </div>

          {/* Terms container */}
          <div className="w3-container" id="terms" style={{ "padding-bottom": "32px" }}>
            <div className="w3-content" style={{ "max-width": "700px" }}>
              <h5 className="w3-center w3-padding-48"><span className="w3-tag w3-wide">OUR TERMS OF SERVICE</span></h5>
              <p>Here are our current terms of service:</p>
              <p>We serve you coffee and tea and other great products but if you act or do any of the following we will ask you to get lost:</p>
              <p>
                <ul>
                  <li>Don't be evil</li>
                  <li>Don't act criminally</li>
                  <li>Don't be a creep</li>
                  <li>Follow the golden rule</li>
                  <li>Clean up after yourself</li>
                  <li>Respect individuals of all shades and colors</li>
                </ul>
              </p>
            </div>
          </div>

          {/* privacy policy */}
          <div className="w3-container" id="privacy" style={{ "padding-bottom": "32px" }}>
            <div className="w3-content" style={{ "max-width": "700px" }}>
              <h5 className="w3-center w3-padding-48"><span className="w3-tag w3-wide">OUR PRIVACY POLICY</span></h5>

              <p>We respect all our visitors privacy. To that end we will follow this privacy policy:</p>

              <h1>Privacy Policy</h1>

              <p>Effective date: November 27, 2018</p>

              <p>Cafe LLC ("us", "we", or "our") operates the cafe.local website (the "Service").</p>

              <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data. Our Privacy Policy  for Cafe LLC is managed through <a href="https://www.freeprivacypolicy.com/free-privacy-policy-generator.php">Free Privacy Policy Website</a>.</p>

              <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, accessible from cafe.local</p>

              <h2>Information Collection And Use</h2>

              <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

              <h3>Types of Data Collected</h3>

              <h4>Personal Data</h4>

              <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>

              <ul>
                <li>Email address</li>
                <li>Cookies and Usage Data</li>
              </ul>

              <h4>Usage Data</h4>

              <p>We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

              <h4>Tracking &amp; Cookies Data</h4>
              <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
              <p>Cookies are files with small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.</p>
              <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>
              <p>Examples of Cookies we use:</p>
              <ul>
                <li><strong>Required Cookies.</strong> We use Session Cookies to operate our Service.</li>
                <li><strong>User Personalization Cookies.</strong> We use Preference Cookies to remember your preferences and various settings.</li>
                <li><strong>Statistics Cookies.</strong> We use Statistics Cookies for statistics purposes.</li>
              </ul>

              <h2>Use of Data</h2>

              <p>Cafe LLC uses the collected data for various purposes:</p>
              <ul>
                <li>To provide and maintain the Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer care and support</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>

              <h2>Transfer Of Data</h2>
              <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
              <p>If you are located outside United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to United States and process it there.</p>
              <p>Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>
              <p>Cafe LLC will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.</p>

              <h2>Disclosure Of Data</h2>

              <h3>Legal Requirements</h3>
              <p>Cafe LLC may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
              <ul>
                <li>To comply with a legal obligation</li>
                <li>To protect and defend the rights or property of Cafe LLC</li>
                <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>To protect the personal safety of users of the Service or the public</li>
                <li>To protect against legal liability</li>
              </ul>

              <h2>Security Of Data</h2>
              <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

              <h2>Service Providers</h2>
              <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.</p>
              <p>These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

              <h2>Links To Other Sites</h2>
              <p>Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
              <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>

              <h2>Children's Privacy</h2>
              <p>Our Service does not address anyone under the age of 18 ("Children").</p>
              <p>We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

              <h2>Changes To This Privacy Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
              <p>We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
              <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul>
                <li>By email: support@cafe.local</li>
              </ul>
            </div>
          </div>

        {/* End page content */}
        </div>

        {/* Footer */}
        <footer className="w3-center w3-light-grey w3-padding-48 w3-large">
          <p>sample template</p>
        </footer>
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
      </React.Fragment>
    );
  }
}

export default App;
