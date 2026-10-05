type CompressImageOptions = {
  maxSize?: number;
  quality?: number;
};

export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<Blob> {
  const {
    maxSize = 1600,
    quality = 0.8,
  } = options;

  const image = await loadImage(file);

  const originalWidth = image.naturalWidth;
  const originalHeight = image.naturalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxSize || height > maxSize) {
    if (width >= height) {
      const ratio = maxSize / width;

      width = maxSize;
      height = Math.round(height * ratio);
    } else {
      const ratio = maxSize / height;

      height = maxSize;
      width = Math.round(width * ratio);
    }
  }

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "De afbeelding kon niet worden verwerkt."
    );
  }

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  const blob = await new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(
              new Error(
                "De afbeelding kon niet worden gecomprimeerd."
              )
            );

            return;
          }

          resolve(result);
        },
        "image/webp",
        quality
      );
    }
  );

  URL.revokeObjectURL(image.src);

  return blob;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () => {
      URL.revokeObjectURL(image.src);

      reject(
        new Error(
          `Afbeelding "${file.name}" kon niet worden geopend.`
        )
      );
    };

    image.src = URL.createObjectURL(file);
  });
}