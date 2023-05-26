import React, { useState, useRef } from "react";
import { pixelateImage } from "../api/convert";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10); // Default pixel size
  const [pixelatedImage, setPixelatedImage] = useState(null); // Store the pixelated image data
  const imageRef = useRef(null);
  const frameSize = 300; // Adjust the frame size as needed

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handlePixelate = async () => {
    if (!selectedImage) return;

    try {
      const resizedImage = resizeImage();
      const pixelatedImage = await pixelateImage(resizedImage, pixelSize);

      setPixelatedImage(pixelatedImage);
    } catch (error) {
      console.error(error);
    }
  };

  const resizeImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = frameSize;
    canvas.height = frameSize;

    const context = canvas.getContext("2d");
    context.drawImage(imageRef.current, 0, 0, frameSize, frameSize);

    return canvas.toDataURL("image/jpeg");
  };

  return (
    <div>
      {/* Image upload UI */}
      <input type="file" onChange={handleImageUpload} />

      {/* Image preview */}
      {selectedImage && (
        <div className="image-preview">
          <img
            ref={imageRef}
            src={selectedImage}
            alt="pixelate"
            width={frameSize}
            height={frameSize}
          />
        </div>
      )}

      {/* Pixel size selection */}
      <div>
        <label htmlFor="pixelSize">Pixels per brick:</label>
        <input
          type="number"
          id="pixelSize"
          value={pixelSize}
          onChange={(e) => setPixelSize(Number(e.target.value))}
          min={1}
        />
      </div>

      {/* Pixelate button */}
      <button
        onClick={handlePixelate}
        className="p-2 text-xs md:text-sm bg-gradient-to-b from-orange-200 to-orange-400 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 active:from-orange-500 text-white"
      >
        Pixelate!
      </button>

      {/* Display the pixelated image */}
      {pixelatedImage && (
        <div>
          <h3>Pixelated Image:</h3>
          <img src={pixelatedImage} alt="pixelated" />
        </div>
      )}
    </div>
  );
};

export default Pixelate;
