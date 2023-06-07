import React, { useState, useRef } from "react";
import { pixelateImage } from "../api/convert";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10); // Default pixel size
  const [pixelatedImage, setPixelatedImage] = useState(null); // Store the pixelated image data
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const imageRef = useRef(null);
  const frameSize = 400; // Adjust the frame size as needed

  const options = [
    { label: "32x32 Brick (10\"x10\")", value: 10 },
    { label: "64x64 Brick (20\"x20\")", value: 20 },
    { label: "96x96 Lego Bricks (30\"x30\")", value: 30 },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handlePixelate = async () => {
    if (!selectedImage) {
      setErrorMessage("Error! Please upload an image before pixelating.");
      return;
    }

    try {
      const resizedImage = resizeImage();
      let adjustedPixelSize = pixelSize;

      // Adjust pixel size for more detailed Lego pixels
      if (pixelSize === 30) {
        adjustedPixelSize = 10;
      } else if (pixelSize === 20) {
        adjustedPixelSize = 20;
      } else if (pixelSize === 10) {
        adjustedPixelSize = 30;
      }

      const pixelatedImage = await pixelateImage(resizedImage, adjustedPixelSize);

      setPixelatedImage(pixelatedImage);
      setErrorMessage(""); // This will clear any previous error message
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
    <div className="upload-section">
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
      <div className="pixelsPerBrick">
        <label htmlFor="pixelSize">Pixels per brick:</label>
        <select
          id="pixelSize"
          value={pixelSize}
          onChange={(e) => setPixelSize(Number(e.target.value))}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

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



// import React, { useState, useRef } from "react";
// import { pixelateImage } from "../api/convert";

// const Pixelate = () => {
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [pixelSize, setPixelSize] = useState(10); // Default pixel size
//   const [pixelatedImage, setPixelatedImage] = useState(null); // Store the pixelated image data
//   const imageRef = useRef(null);
//   const frameSize = 300; // Adjust the frame size as needed
//   //instead of inputting number of pixels manually, users have 3 choices
//   const options = [
//     { label: "32x32 Brick (10\"x10\")", value: 10 },
//     { label: "64x64 Brick (20\"x20\")", value: 20 },
//     { label: "96x96 Lego Bricks (30\"x30\")", value: 30 },
//   ];


//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       setSelectedImage(e.target.result);
//     };

//     reader.readAsDataURL(file);
//   };

//   const handlePixelate = async () => {
//     if (!selectedImage) return;

//     try {
//       const resizedImage = resizeImage();
//       const pixelatedImage = await pixelateImage(resizedImage, pixelSize);

//       setPixelatedImage(pixelatedImage);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const resizeImage = () => {
//     const canvas = document.createElement("canvas");
//     canvas.width = frameSize;
//     canvas.height = frameSize;

//     const context = canvas.getContext("2d");
//     context.drawImage(imageRef.current, 0, 0, frameSize, frameSize);

//     return canvas.toDataURL("image/jpeg");
//   };

//   return (
//     <div>
//       {/* Image upload UI */}
//       <input type="file" onChange={handleImageUpload} />

//       {/* Image preview */}
//       {selectedImage && (
//         <div className="image-preview">
//           <img
//             ref={imageRef}
//             src={selectedImage}
//             alt="pixelate"
//             width={frameSize}
//             height={frameSize}
//           />
//         </div>
//       )}

//       {/* Pixel size selection */}
//       <div>
//         <label htmlFor="pixelSize">Pixels per brick:</label>
//         <input
//           type="number"
//           id="pixelSize"
//           value={pixelSize}
//           onChange={(e) => setPixelSize(Number(e.target.value))}
//           min={1}
//         />
//       </div>

//       {/* Pixelate button */}
//       <button
//         onClick={handlePixelate}
//         className="p-2 text-xs md:text-sm bg-gradient-to-b from-orange-200 to-orange-400 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 active:from-orange-500 text-white"
//       >
//         Pixelate!
//       </button>

//       {/* Display the pixelated image */}
//       {pixelatedImage && (
//         <div>
//           <h3>Pixelated Image:</h3>
//           <img src={pixelatedImage} alt="pixelated" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Pixelate;
