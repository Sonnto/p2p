import React, { useState, useRef, useEffect } from "react";
import { pixelateImage } from "../api/convert";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [convertedData, setConvertedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const imageRef = useRef(null);
  const frameSize = 200;
  const [cropper, setCropper] = useState(null); //sets cropped image if it's not perfect square

  const options = [
    { label: '32x32 Brick (10"x10")', value: 10 },
    { label: '64x64 Brick (20"x20")', value: 20 },
    { label: '96x96 Lego Bricks (30"x30")', value: 30 },
  ];

  useEffect(() => {
    if (selectedImage) {
      const cropperInstance = new Cropper(imageRef.current, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 1,
        cropBoxResizable: true,
      });
      setCropper(cropperInstance);
    }
  }, [selectedImage]);

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
      const croppedImage = cropper.getCroppedCanvas().toDataURL("image/jpeg");
      const pixelatedImageResult = await pixelateImage(croppedImage, pixelSize);

      setConvertedData(pixelatedImageResult);
      setErrorMessage("");

      const instructions = pixelatedImageResult.instructions;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawText(instructions, {
        x: 50,
        y: height - 100,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      // Convert the PDF bytes to base64
      const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

      console.log("Frontend PDF being stored: ", pdfBase64);
      // Allows PDF to be downloaded
      const instructionsFile = new File([pdfBytes], "instructions.pdf");

      const requestData = {
        originalImage: selectedImage,
        pixelatedImage: pixelatedImageResult.pixelatedImage,
        instructions: pdfBase64,
        segment: segment,
      };

      fetch("http://localhost:1225/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data sent successfully:", data);
        })
        .catch((error) => {
          console.error("Error storing data in the database:", error);
        });

      // console.log("originalImage: ", selectedImage);
      // console.log("pixelatedImage: ", pixelatedImageResult.pixelatedImage);
      // console.log("instructionsFile: ", instructionsFile);
      // console.log("segment: ", segment);

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
    <div className="pixelate-container">
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
            placeholder="Say something about this"
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button onClick={handlePixelate} className="pixelate-button"
          //className="p-2 text-xs md:text-sm bg-gradient-to-b from-orange-200 to-orange-400 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 active:from-orange-500 text-white"
        >
          Pixelate!
        </button>

        {convertedData && (
          <div>
            <h3>Pixelated Image:</h3>
            <img src={convertedData.pixelatedImage} alt="pixelated" />
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="instructions.pdf"
            className="download-button"
          >
            Download Instructions
          </a>
        )}

        <div>
          <a href="./" className="refresh-button ">
            <i className="fa-solid fa-arrows-rotate"></i> Refresh Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pixelate;
