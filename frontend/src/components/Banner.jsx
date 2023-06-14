import React from "react";

// function Banner() {
//   return (
//     <div>
//       <h1>The Hero Banner will go here</h1>
//     </div>
//   );
// }
export default function Banner() {
  return (
    <section id="hero">
      <div className="section-container">
        <div className="hero-texts">
          <h2 className="hero-title">Lego-ize your photos!</h2>
          <p className="hero-text">
            Transform your uploaded images into LEGO shuds for free!
          </p>

          <p className="hero-text">
            Start building your unique creations today!
          </p>
        </div>
        <img
          src="../images/vangogh-brick.jpeg"
          alt="Van Gogh in Lego Bricks"
          className="hero-image"
        />
      </div>
    </section>
  );
}
