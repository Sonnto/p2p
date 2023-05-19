import React, { useState } from "react";

const Pixelate = () => {
  const [selectedImage, setSelectedImage] = useState(null);

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

    fetch("/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedImage, pixelSize: 10 }),
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

  return (
    <div>
      {/* Image upload UI */}
      <input type="file" onChange={handleImageUpload} />

      {/* Image preview */}
      {selectedImage && (
        <img src={selectedImage} alt="Preview" width={500} height={500} />
      )}

      {/* Pixelate button */}
      <button onClick={handlePixelate} className="button text-white">
        Pixelate!
      </button>
    </div>
  );
};

export default Pixelate;
