import {
  Button,
  Checkbox,
  FormField,
  MultilineInput,
  Rows,
  Select,
  Text,
  Title
} from "@canva/app-ui-kit";
import { ImageRef, initAppElement } from "@canva/design";
import { DraggableImage } from "components/draggable_image";
import hljs from 'highlight.js/lib/common';
import React from "react";
import Sparkles from 'react-sparkle';
import styles from "styles/components.css";
import MagicLoadingIcon from "../assets/icons/icon-magic-loading.inline.svg";
import { Styles, getStyle } from "./styles";

type UIState = AppElementData & {
  elementSelected: boolean,
};

type AppElementData = {
  sourceText: string,
  currentStyleIndex: number,
  selectedLanguage: string,
  transparentBackground: boolean,
};

const AUTODETECT_LANGUAGE = "Auto Detect";
const languages = [AUTODETECT_LANGUAGE, ...hljs.listLanguages()];

const initialState: UIState = {
  elementSelected: false,
  sourceText: "",
  currentStyleIndex: 0,
  selectedLanguage: AUTODETECT_LANGUAGE,
  transparentBackground: false
};


const appElementClient = initAppElement<AppElementData>({
  render: (data) => {
    const {
      dataUrl,
      width,
      height
    } = generateImage(data);

    return [{
      type: "IMAGE",
      dataUrl,
      top: 0,
      left: 0,
      width,
      height,
    }];
  },
});

export const App = () => {
  const [state, setState] = React.useState<UIState>(initialState);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);
  const [formatting, setFormatting] = React.useState(false);

  const {
    sourceText,
    currentStyleIndex,
    selectedLanguage,
    elementSelected,
    transparentBackground
  } = state;

  function updateState(stateChanges: Partial<UIState>) {
    const newState = { ...state, ...stateChanges };

    if (newState.sourceText === "") {
      setPreviewUrl(undefined);
    } else {
      setPreviewUrl(generateImage(newState).dataUrl);
    }

    setState(newState);
  }

  function resetState() {
    setPreviewUrl(undefined);
    setState(s => ({
      ...initialState,
      transparentBackground: s.transparentBackground,
      currentStyleIndex: s.currentStyleIndex,
    }));
  }

  async function formatCode() {
    setFormatting(true);
    updateState({ sourceText: state.sourceText })
    setFormatting(false);
  }

  React.useEffect(() => {
    appElementClient.registerOnElementChange((element) => {
      if (element) {
        updateState({ ...element.data, elementSelected: true });
      } else {
        resetState();
      }
    });
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <FormField
          label="Source Text"
          value={sourceText}
          control={props => (
            <div className={styles.inputContainer}>
              <MultilineInput
                {...props}
                placeholder="console.log('Hello World');"
                minRows={8}
                maxLength={1024 * 4.5}
                onChange={(value) => updateState({ sourceText: value })}
                disabled={formatting}
              />
              {formatting && <MagicLoading />}
            </div>
          )}
        />
        <FormField
          label="Language"
          value={currentStyleIndex}
          control={props => (
            <Select
              {...props}
              stretch={true}
              placeholder="Specify a language"
              value={selectedLanguage}
              options={languages.map(element => { return { value: element } })}
              onChange={value => updateState({ selectedLanguage: value })}
              disabled={formatting}
            />
          )}
        />
        <FormField
          label="Theme"
          value={currentStyleIndex}
          control={props => (
            <Select
              {...props}
              stretch={true}
              options={Styles}
              onChange={(value) => updateState(({ currentStyleIndex: value }))}
              disabled={formatting}
            />
          )}
        />
        <Checkbox
          label="Transparent background"
          checked={transparentBackground}
          onChange={(_, checked) => updateState({ transparentBackground: checked })}
          disabled={formatting}
        />
        {previewUrl && (
          <div className={styles.previewContainer}>
            <Rows spacing="0.5u">
              <Title size="small">Preview</Title>
              {!elementSelected &&
                <Text size="small" tone="tertiary">
                  Drag the image to your design
                </Text>}
              <div className={styles.scrollImage}>
                {elementSelected ?
                  <img src={previewUrl} /> :
                  <DraggableImage
                    resolveImageRef={() => {
                      return new Promise<{ ref: ImageRef }>(() => {
                        appElementClient.addOrUpdateElement(state);
                      });
                    }}
                    src={previewUrl}
                    style={{ borderRadius: "2px" }}
                  />}
              </div>
            </Rows>
          </div>
        )}
        <div className={styles.magicButtonContainer}>
          <Button
            variant="primary"
            stretch={true}
            onClick={() => appElementClient.addOrUpdateElement(state)}
            disabled={formatting}
          >
            {elementSelected ? "Update codeblock" : "Add codeblock to design"}
          </Button>
          <div className={styles.magicButtonSparkles}>
            <Sparkles
              color="rgb(0, 196, 204)"
              count={20}
              minSize={5}
              maxSize={12}
              overflowPx={10}
              fadeOutSpeed={30}
              flicker={false}
            />
          </div>
        </div>
      </Rows >
    </div >
  );
};
function generateImage({ sourceText, selectedLanguage, currentStyleIndex, transparentBackground }: AppElementData) {
  const styleSheet = getStyle(currentStyleIndex);
  const highlightedCode = generateCode(sourceText, selectedLanguage);

  return generateDataUrl(highlightedCode, styleSheet, transparentBackground);
}

function generateCode(sourceText: string, language: string) {
  const output = language === AUTODETECT_LANGUAGE
    ? hljs.highlightAuto(sourceText)
    : hljs.highlight(sourceText, { language });
  return output.value.replace(/\n/g, '<span>\n</span>');
}

function generateDataUrl(highlightedCode: string, styleSheet: string, transparentBackground: boolean) {
  // Add element to body to render highlighted code
  const renderRoot = document.createElement('div');
  document.body.appendChild(renderRoot);

  // Add code stylesheet to DOM tree
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styleSheet;
  document.head.appendChild(styleElement);

  // We need a Pre because they special
  const preElement = document.createElement('pre');
  renderRoot.appendChild(preElement);

  // Now we create the code element and put the code in it
  const codeElement = document.createElement('code');
  codeElement.classList.add('hljs')
  codeElement.innerHTML = highlightedCode;
  preElement.appendChild(codeElement);

  // Get background color
  const backgroundColor = transparentBackground ? "transparent" : window.getComputedStyle(codeElement).getPropertyValue('background-color');

  // Actual do the render
  const { canvas, width, height } = renderDomToCanvas(renderRoot, backgroundColor);
  const dataUrl = canvas.toDataURL();
  renderRoot.remove();

  return { dataUrl, width, height };
}

function renderDomToCanvas(renderRoot: HTMLElement, backgroundColor: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d')!;
  const ratio = window.devicePixelRatio;
  const range = document.createRange();

  // Iterate all elements in
  const renderDetails = Array.from(renderRoot.childNodes)
    .flatMap(node => node.nodeType === Node.TEXT_NODE
      ? getNodeDetails(node, range)
      : getElementDetails(node as HTMLElement, range)
    );

  const bounds = findBounds(renderDetails);
  const canvasMargins = 20;
  const originX = bounds.minX - canvasMargins;
  const originY = bounds.minY - canvasMargins;
  const width = bounds.maxX - originX + canvasMargins * 2;
  const height = bounds.maxY - originY + canvasMargins * 2;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.scale(ratio, ratio);
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each element with they assumption we have a list of spans
  for (const details of renderDetails) {
    const {
      content,
      position,
      font,
      color,
    } = details;

    const x = position.left - originX + canvasMargins;
    const y = position.top - originY + canvasMargins;

    context.font = font;
    context.fillStyle = color;
    context.fillText(content, x, y);
  }
  range.detach();

  return { canvas, width, height };
}

function findBounds(details: { position: DOMRect }[]) {
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = 0;
  let maxY = 0;

  for (const { position } of details) {
    if (position.left < minX) {
      minX = position.left;
    }
    if (position.right > maxX) {
      maxX = position.right;
    }
    if (position.top < minY) {
      minY = position.top;
    }
    if (position.bottom > maxY) {
      maxY = position.bottom;
    }
  }

  return { minX, maxX, minY, maxY };
}

function getElementDetails(currentElement: HTMLElement, range: Range) {
  if (!onlyHasTextChild(currentElement)) {
    return Array.from(currentElement.childNodes)
      .flatMap(node => node.nodeType === Node.TEXT_NODE
        ? getNodeDetails(node, range)
        : getElementDetails(node as HTMLElement, range)
      )
  }

  const content = currentElement.textContent ?? "";
  const styles = window.getComputedStyle(currentElement);
  const position = currentElement.getBoundingClientRect();
  const color = styles.getPropertyValue("color");
  const font = styles.getPropertyValue("font");

  return [{ content, styles, position, color, font, type: 'span' }];
}

function onlyHasTextChild(currentElement: HTMLElement) {
  if (currentElement.childNodes.length > 1) {
    return false;
  }
  if (currentElement.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  return true;
}

function getNodeDetails(currentNode: ChildNode, range: Range) {
  if (!currentNode.parentElement) {
    throw "Why you doing some freaky shit";
  }

  range.selectNode(currentNode);
  const content = currentNode.textContent ?? "";
  const styles = window.getComputedStyle(currentNode.parentElement);
  const position = range.getBoundingClientRect();
  const color = styles.getPropertyValue("color");
  const font = styles.getPropertyValue("font");

  return [{ content, styles, position, color, font, type: 'text' }];
}


function MagicLoading() {
  return (
    <div aria-hidden="true" className={styles.magicLoading}>
      <div className={styles.magicLoadingPositioner}>
        <MagicLoadingIcon />
      </div>
    </div>
  );
}
