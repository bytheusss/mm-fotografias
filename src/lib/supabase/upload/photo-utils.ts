export function formatPhotoNumber(number: number) {
    return String(number).padStart(4, "0");
  }
  
  export function getPhotoPath(
    eventFolder: string,
    photoNumber: number
  ) {
    const fileName = `${formatPhotoNumber(photoNumber)}.jpg`;
  
    return {
      original: `${eventFolder}/${fileName}`,
      preview: `${eventFolder}/${fileName}`,
      thumbnail: `${eventFolder}/${fileName}`,
    };
  }