import React from "react";
import cat from "assets/images/cat.jpg";
import dog from "assets/images/dog.jpg";
import rabbit from "assets/images/rabbit.jpg";
import styles from "styles/components.css";
import { initAppElement } from "@canva/design";
import {
  Box,
  Button,
  FormField,
  NumberInput,
  Rows,
  Text,
  TextInput,
} from "@canva/app-ui-kit";
import clsx from "clsx";

// We can't store the image's data URL in the app element's data, since it
// exceeds the 5kb limit. We can, however, store an ID that references the
// image.
type AppElementData = {
  imageId: string;
  width: number;
  height: number;
  rotation: number | undefined;
};

type UIState = AppElementData;

const images = {
  dog: {
    title: "Dog",
    imageSrc: dog,
  },
  cat: {
    title: "Cat",
    imageSrc: cat,
  },
  rabbit: {
    title: "Rabbit",
    imageSrc: rabbit,
  },
};

const initialState: UIState = {
  imageId: "dog",
  width: 400,
  height: 400,
  rotation: 0,
};

const appElementClient = initAppElement<AppElementData>({
  render: (data) => {
    return [
      {
        type: "IMAGE",
        top: 0,
        left: 0,
        dataUrl: images[data.imageId].imageSrc,
        ...data,
      },
    ];
  },
});

export const App = () => {
  const [state, setState] = React.useState<UIState>(initialState);
  const { imageId, width, height, rotation } = state;
  const disabled = !imageId || imageId.trim().length < 1;

  const items = Object.entries(images).map(([key, value]) => {
    const { title, imageSrc } = value;
    return {
      key,
      title,
      imageSrc,
      active: imageId === key,
      onClick: () => {
        setState((prevState) => {
          return {
            ...prevState,
            imageId: key,
          };
        });
      },
    };
  });

  React.useEffect(() => {
    appElementClient.registerOnElementChange((appElement) => {
      setState(appElement ? appElement.data : initialState);
    });
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Text>
          This example demonstrates how apps can create image elements inside
          app elements. This makes the element re-editable and lets apps control
          additional properties, such as the width and height.
        </Text>
        <FormField
          label="Select an image"
          control={(props) => (
            <Box id={props.id} paddingTop="1u">
              <div className={styles.thumbnailGrid}>
                {items.map((item) => (
                  <img
                    className={clsx(
                      styles.thumbnail,
                      item.active && styles.active
                    )}
                    key={item.key}
                    src={item.imageSrc}
                    onClick={item.onClick}
                    alt={item.title}
                  />
                ))}
              </div>
            </Box>
          )}
        />
      </Rows>
      <Rows spacing="2u">
        <FormField
          label="Data URL"
          value={images[imageId].imageSrc}
          control={(props) => <TextInput {...props} onChange={() => {}} />}
        />
        <FormField
          label="Width"
          value={width}
          control={(props) => (
            <NumberInput
              {...props}
              min={1}
              onChange={(value) => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    width: Number(value || 0),
                  };
                });
              }}
            />
          )}
        />
        <FormField
          label="Height"
          value={height}
          control={(props) => (
            <NumberInput
              {...props}
              min={1}
              onChange={(value) => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    height: Number(value || 0),
                  };
                });
              }}
            />
          )}
        />
        <FormField
          label="Rotation"
          value={rotation}
          control={(props) => (
            <NumberInput
              {...props}
              min={-180}
              max={180}
              onChange={(value) => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    rotation: Number(value || 0),
                  };
                });
              }}
            />
          )}
        />
        <Button
          variant="primary"
          onClick={() => {
            appElementClient.addOrUpdateElement(state);
          }}
          disabled={disabled}
          stretch
        >
          Add image to design
        </Button>
      </Rows>
    </div>
  );
};
