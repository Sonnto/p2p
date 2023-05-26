const pixelateImage = async (imageDataUrl, blockSize) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      const { width, height } = image;
      const numBlocksX = Math.ceil(width / blockSize);
      const numBlocksY = Math.ceil(height / blockSize);
      const pixelatedWidth = numBlocksX * blockSize;
      const pixelatedHeight = numBlocksY * blockSize;

      canvas.width = pixelatedWidth;
      canvas.height = pixelatedHeight;

      context.drawImage(image, 0, 0, pixelatedWidth, pixelatedHeight);

      const imageData = context.getImageData(
        0,
        0,
        pixelatedWidth,
        pixelatedHeight
      );
      const data = imageData.data;

      const blockColors = {}; // Object to store block colors and their counts, will have to figure out how to use with Colours API

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

      context.putImageData(imageData, 0, 0);

      const pixelatedPhotoData = canvas.toDataURL("image/jpeg");

      // Log the results for each block color
      console.log("Block colors:");
      Object.entries(blockColors).forEach(([colorKey, count]) => {
        const [r, g, b] = colorKey.split("_").map(Number);
        console.log(`RGB(${r}, ${g}, ${b}): ${count} blocks`);
      });

      // Log the total number of blocks
      const totalBlocks = Object.values(blockColors).reduce(
        (total, count) => total + count,
        0
      );
      console.log(`Total amount of blocks required: ${totalBlocks}`);

      resolve(pixelatedPhotoData);
    };

    image.onerror = () => {
      reject(new Error("Failed to load image."));
    };

    image.src = imageDataUrl;
  });
};

module.exports = {
  pixelateImage,
};
