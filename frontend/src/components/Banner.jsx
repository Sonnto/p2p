import React from "react";

// function Banner() {
//   return (
//     <div>
//       <h1>The Hero Banner will go here</h1>
//     </div>
//   );
// }
function Banner() {
  return (
    <section id="hero">
      <div class="section-container">
        <div class="hero-texts">
          <h2 class="hero-title">Lego-lize your photos!</h2>
          <p class="hero-text">
            Transform your uploaded images into LEGO shuds for free!
          </p>

          <p class="hero-text">Start building your unique creations today!</p>
        </div>
        <img
          src="../images/vangogh-brick.jpeg"
          alt="Van Gogh in Lego Bricks"
          class="hero-image"
        />
      </div>
    </section>
  );
}

export default Banner;
