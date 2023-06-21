export default function Header() {
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
            <a href="https://www.lego.com/en-ca/pick-and-build/pick-a-brick">
              Buy LEGO
            </a>
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
