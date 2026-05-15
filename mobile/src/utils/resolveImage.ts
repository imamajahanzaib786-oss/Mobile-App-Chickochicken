import { ImageSourcePropType } from 'react-native';

export const resolveImage = (imagePath?: string): ImageSourcePropType | { uri: string } => {
  const cleanPath = imagePath?.trim();

  switch (cleanPath) {
    case "/assets/pizza1.png":
      return require("../../assets/pizza1.png");
    case "/assets/pizza2.png":
      return require("../../assets/pizza2.png");
    case "/assets/pizza3.png":
      return require("../../assets/pizza3.png");
    case "/assets/pizza4.png":
      return require("../../assets/pizza4.png");
    case "/assets/pizza5.png":
      return require("../../assets/pizza5.png");
    case "/assets/pizza6.png":
      return require("../../assets/pizza6.png");
    case "/assets/pizza7.png":
      return require("../../assets/pizza7.png");
    case "/assets/pizza8.png":
      return require("../../assets/pizza8.png");
    case "/assets/pizza9.png":
      return require("../../assets/pizza9.png");
    case "/assets/meal2.png":
      return require("../../assets/meal2.png");
    case "/assets/meal3.png":
      return require("../../assets/meal3.png");
    case "/assets/meal4.png":
      return require("../../assets/meal4.png");
    case "/assets/image6.png":
      return require("../../assets/image6.png");
    case "/assets/image5.png":
      return require("../../assets/image5.png");
    case "/assets/shake2.png":
      return require("../../assets/shake2.png");
    case "/assets/peri.png":
      return require("../../assets/peri.jpeg");
    default:
      return { uri: imagePath ?? "" };
  }
};
