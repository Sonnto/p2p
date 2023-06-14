import React from "react";

// function Footer() {
//   return (
//     <footer>
//       <h1>The Footer is here</h1>
//     </footer>
//   );
// }

export default function Footer() {
  return (
    <footer id="footer">
      <h2 id="powerBy">
        Powered by{" "}
        <a href="https://brickmmo.com/" target="_blank" rel="noreferrer">
          <img
            src="../images/brickmmo.png"
            alt="Brick MMO"
            className="brickmmo-logo"
          />
        </a>
      </h2>
      <nav>
        <ul id="socmedia" className="socmedia">
          <li className="socmedia-item">
            <a
              href="https://twitter.com/brickmmo"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-twitter"></i>
            </a>
          </li>
          <li className="socmedia-item">
            <a
              href="https://www.instagram.com/brickmmo/"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </li>
          <li className="socmedia-item">
            <a
              href="https://www.tiktok.com/@brickmmo"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-tiktok"></i>
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
