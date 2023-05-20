const sharp = require("sharp");

const pixelateImage = async (selectedImage, pixelSize) => {
  //pixelate logic here
  //decode image
  const decodedImage = await sharp(Buffer.from(selectedImage, "base64"))
    .toFormat("png") //conver to png for processing
    .toBuffer();
};

module.exports = {
  pixelateImage,
};
