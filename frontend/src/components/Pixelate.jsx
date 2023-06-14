import React, { useState, useRef } from "react";
import { pixelateImage } from "../api/convert";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [convertedData, setConvertedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const imageRef = useRef(null);
  const frameSize = 400;

  const options = [
    { label: '32x32 Brick (10"x10")', value: 10 },
    { label: '64x64 Brick (20"x20")', value: 20 },
    { label: '96x96 Lego Bricks (30"x30")', value: 30 },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const [segment, setSegment] = useState("");

  const handleSegmentChange = (event) => {
    setSegment(event.target.value);
  };

  const [downloadUrl, setDownloadUrl] = useState(null);

  const handlePixelate = async () => {
    if (!selectedImage) {
      setErrorMessage("Error! Please upload an image before pixelating.");
      return;
    }

    try {
      const resizedImage = resizeImage();
      let adjustedPixelSize = pixelSize;

      if (pixelSize === 30) {
        adjustedPixelSize = 10;
      } else if (pixelSize === 20) {
        adjustedPixelSize = 20;
      } else if (pixelSize === 10) {
        adjustedPixelSize = 30;
      }

      const pixelatedImageResult = await pixelateImage(
        resizedImage,
        adjustedPixelSize
      );

      setConvertedData(pixelatedImageResult);
      setErrorMessage("");

      const instructions = pixelatedImageResult.instructions;

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      // Embed a standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Draw the instructions text
      page.drawText(instructions, {
        x: 50,
        y: height - 100,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });

      // Save the PDF document as a blob
      const pdfBytes = await pdfDoc.save();
      const instructionsFile = new File([pdfBytes], "instructions.pdf");

      // Store data in database
      const formData = new FormData();
      formData.append("original_image", selectedImage);
      formData.append("pixelated_image", pixelatedImageResult.pixelatedImage);
      formData.append("instructions", instructionsFile);
      formData.append("segment", segment);

      console.log("originalImage:", selectedImage);
      console.log("pixelatedImage:", pixelatedImageResult.pixelatedImage);
      console.log("instructions:", instructionsFile);
      console.log("segment:", segment);

      // Make a POST request to the backend endpoint
      fetch("/api", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data stored successfully:", data);
        })
        .catch((error) => {
          console.error("Error storing data in the database:", error);
        });

      // Generate the download URL for instructions
      const instructionsUrl = URL.createObjectURL(instructionsFile);
      setDownloadUrl(instructionsUrl);
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
      <input type="file" onChange={handleImageUpload} />

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

      <div className="pixelsPerBrick">
        <label htmlFor="pixelSize">Pixels per brick: </label>
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

      <div>
        <label htmlFor="segment">Segment: </label>
        <input
          type="text"
          id="segment"
          value={segment}
          onChange={handleSegmentChange}
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button
        className="p-2 text-xs md:text-sm bg-gradient-to-b from-orange-200 to-orange-400 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 active:from-orange-500 text-white"
        onClick={handlePixelate}
      >
        {" "}
        Pixelate!
      </button>

      {convertedData && (
        <div>
          <h3>Pixelated Image:</h3>
          <img src={convertedData.pixelatedImage} alt="pixelated" />
        </div>
      )}
      {downloadUrl && (
        <a href={downloadUrl} download="instructions.pdf">
          Download Instructions
        </a>
      )}
    </div>
  );
};

export default Pixelate;
