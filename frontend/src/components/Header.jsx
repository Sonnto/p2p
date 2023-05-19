import React from "react";

function Header() {
  return (
    <header>
      <nav className="text-red-500 flex items-center flex-grow text-xs space-x-6 mx-6 whitespace-nowrap">
        <div>PixelateLogo</div>
        <ul className="flex items-center text-xs space-x-6 mx-6 whitespace-nowrap">
          <li className="mr-4">About BrickMMO</li>
          <li className="mr-4">Buy LEGOs</li>
          <li className="mr-4">Social Media</li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
