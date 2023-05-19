import React, { useState, useRef, useEffect } from "react";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const frameSize = 500; // Adjust the frame size as needed

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handlePixelate = () => {
    if (!selectedImage) return;

    // Calculate the cropping dimensions based on the drag position
    const cropX = Math.max(0, -dragPosition.x);
    const cropY = Math.max(0, -dragPosition.y);
    const cropSize = Math.min(
      frameSize,
      imageRef.current.width - cropX,
      imageRef.current.height - cropY
    );

    // Crop the selected image based on the calculated dimensions
    const croppedImage = cropImage(selectedImage, cropX, cropY, cropSize);

    // Proceed with sending the cropped image to the backend API for pixelation
    fetch("/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedImage: croppedImage, pixelSize: 10 }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data if needed
        console.log(data);
      })
      .catch((error) => {
        // Handle the error
        console.error(error);
      });
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", ""); // Required for drag operation to work properly
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrag = (event) => {
    const { movementX, movementY } = event;
    setDragPosition((prevPosition) => ({
      x: prevPosition.x + movementX,
      y: prevPosition.y + movementY,
    }));
  };

  const cropImage = (imageSrc, x, y, size) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    context.drawImage(imageRef.current, x, y, size, size, 0, 0, size, size);

    return canvas.toDataURL("image/jpeg");
  };

  useEffect(() => {
    setDragPosition({ x: 0, y: 0 });
  }, [selectedImage]);

  return (
    <div>
      {/* Image upload UI */}
      <input type="file" onChange={handleImageUpload} />

      {/* Image preview with drag functionality */}
      {selectedImage && (
        <div
          className="image-preview"
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrag={handleDrag}
          style={{
            width: frameSize,
            height: frameSize,
            overflow: "hidden",
            border: "1px solid black",
          }}
        >
          <img
            ref={imageRef}
            src={selectedImage}
            alt="Preview"
            width={frameSize}
            height={frameSize}
            style={{
              transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
            }}
          />
        </div>
      )}

      {/* Pixelate button */}
      <button onClick={handlePixelate} className="button text-white">
        Pixelate!
      </button>
    </div>
  );
};

export default Pixelate;
