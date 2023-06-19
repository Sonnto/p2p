const pixelateImage = async (imageDataUrl, blockSize) => {
  return new Promise((resolve, reject) => {
    const image = new Image(); // Create a new HTML image element

    image.onload = () => {
      const canvas = document.createElement("canvas"); // Create a canvas element
      const context = canvas.getContext("2d"); // Get the 2D rendering context of the canvas

      const { width, height } = image; // Get the width and height of the image
      const numBlocksX = Math.ceil(width / blockSize); // Calculate the number of blocks in the X direction
      const numBlocksY = Math.ceil(height / blockSize); // Calculate the number of blocks in the Y direction
      const pixelatedWidth = numBlocksX * blockSize; // Calculate the width of the pixelated image
      const pixelatedHeight = numBlocksY * blockSize; // Calculate the height of the pixelated image

      canvas.width = pixelatedWidth; // Set the canvas width
      canvas.height = pixelatedHeight; // Set the canvas height

      context.drawImage(image, 0, 0, pixelatedWidth, pixelatedHeight); // Draw the image onto the canvas

      const imageData = context.getImageData(
        0,
        0,
        pixelatedWidth,
        pixelatedHeight
      ); // Get the pixel data of the canvas
      const data = imageData.data; // Get the pixel data array

      const blockColors = {}; // Object to store block colors and their counts

      for (let y = 0; y < numBlocksY; y++) {
        for (let x = 0; x < numBlocksX; x++) {
          const blockStartX = x * blockSize;
          const blockStartY = y * blockSize;

          let totalRed = 0;
          let totalGreen = 0;
          let totalBlue = 0;
          let totalPixels = 0;
          let dominantColor = { r: 0, g: 0, b: 0 };
          let maxPixelCount = 0;

          for (let i = blockStartY; i < blockStartY + blockSize; i++) {
            for (let j = blockStartX; j < blockStartX + blockSize; j++) {
              const pixelIndex = (i * pixelatedWidth + j) * 4;

              const red = data[pixelIndex];
              const green = data[pixelIndex + 1];
              const blue = data[pixelIndex + 2];

              totalRed += red;
              totalGreen += green;
              totalBlue += blue;
              totalPixels++;

              const pixelCount = Math.round(
                ((red + green + blue) / (255 * 3)) * blockSize * blockSize
              );

              if (pixelCount > maxPixelCount) {
                maxPixelCount = pixelCount;
                dominantColor = { r: red, g: green, b: blue };
              }
            }
          }

          const averageRed = Math.round(totalRed / totalPixels);
          const averageGreen = Math.round(totalGreen / totalPixels);
          const averageBlue = Math.round(totalBlue / totalPixels);

          for (let i = blockStartY; i < blockStartY + blockSize; i++) {
            for (let j = blockStartX; j < blockStartX + blockSize; j++) {
              const pixelIndex = (i * pixelatedWidth + j) * 4;
              data[pixelIndex] = averageRed;
              data[pixelIndex + 1] = averageGreen;
              data[pixelIndex + 2] = averageBlue;
            }
          }

          // Increment the count of the dominant color
          const colorKey = `${dominantColor.r}_${dominantColor.g}_${dominantColor.b}`;
          if (blockColors[colorKey]) {
            blockColors[colorKey]++;
          } else {
            blockColors[colorKey] = 1;
          }
        }
      }

      // Log the total number of blocks
      const totalBlocks = Object.values(blockColors).reduce(
        (total, count) => total + count,
        0
      );
      context.putImageData(imageData, 0, 0); // Put the modified pixel data back onto the canvas

      // Log the results for each block color
      // console.log("Block colors:")
      let instructions = "";
      Object.entries(blockColors).forEach(([colorKey, count]) => {
        const [r, g, b] = colorKey.split("_").map(Number);
        // console.log(`RGB(${r}, ${g}, ${b}): ${count} blocks`);
        instructions += `RGB(${r}, ${g}, ${b}): ${count} blocks ${totalBlocks}/\n`;
      });
      // console.log(`Total amount of blocks required: ${totalBlocks}`);

      const result = {
        pixelatedImage: canvas.toDataURL("image/jpeg"),
        instructions,
      };

      resolve(result); // Resolve the promise with result object
    };

    image.onerror = () => {
      reject(new Error("Failed to load image."));
    };

    image.src = imageDataUrl; // Set the image source to the provided data URL
  });
};

module.exports = {
  pixelateImage,
};
