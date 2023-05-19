import React from "react";
import { fabric } from "fabric";

function Pixelate() {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        const canvas = new fabric.Canvas("canvas");

        const fabricImage = new fabric.Image(image);
        canvas.add(fabricImage);

        // Perform pixelation logic on the fabricImage object here
        // You can use the fabric.js API to manipulate the image

        canvas.renderAll();
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>The Pixelation magic component will happen here</h1>
      <input type="file" onChange={handleImageUpload} />
    </div>
  );
}

export default Pixelate;
