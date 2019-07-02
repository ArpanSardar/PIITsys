import React from "react";
import "./footer.css";

const Footer = () => (
  <div id="footer">
    <footer>
      <ul className="quick_links">
        <li className="" data-wow-delay="0.2s">
          <a href="http://willings.co.jp/en/">Willings, Inc.</a>
        </li>
        <li className="" data-wow-delay="0.6s">
          <a href="https://willings.co.jp/en/contact">Contact Us</a>
        </li>
        <li className="" data-wow-delay="0.8s">
          <a href="javascript:void(0)">FAQ</a>
        </li>
        <li className="" data-wow-delay="1s">
          <a href="javascript:void(0)">Privacy Policy</a>
        </li>
      </ul>
      <div className="clearfix" />
      <div className="socialIcons">{/* <img src={ooter}/> */}</div>
      <div className="clearfix" />
      <p className="copyRight">© 2019 Willings, Inc. All rights reserved.</p>
    </footer>
  </div>
);

export default Footer;
