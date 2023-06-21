import React, { useState } from "react";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header id="header">
      <h2 id="site-name">
        <a href="/">Pixelate</a>
      </h2>
      <nav>
        <ul id="navbar">
          <li className="nav-item">
            <a href="#sec-about">About BRICKMMO</a>
          </li>
          <li className="nav-item">
            <a href="#sec-purchase">Buy LEGO</a>
          </li>
          <li className="nav-item">
            <a href="#sec-socmed">
              <i className="fa-brands fa-twitter"></i>{" "}
            </a>
          </li>
          <li className="nav-item">
            <a href="#sec-socmed">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </li>
          <li className="nav-item">
            <a href="#sec-socmed">
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
