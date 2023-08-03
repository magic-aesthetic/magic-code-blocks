/* eslint import/no-webpack-loader-syntax: off */
import github from '!!raw-loader!highlight.js/styles/github.css';
/* eslint import/no-webpack-loader-syntax: off */
import androidstudio from '!!raw-loader!highlight.js/styles/androidstudio.css';
/* eslint import/no-webpack-loader-syntax: off */
import arduinnoLight from '!!raw-loader!highlight.js/styles/arduino-light.css';
/* eslint import/no-webpack-loader-syntax: off */
import atom from '!!raw-loader!highlight.js/styles/atom-one-dark-reasonable.css';
/* eslint import/no-webpack-loader-syntax: off */
import atomLight from '!!raw-loader!highlight.js/styles/atom-one-light.css';
/* eslint import/no-webpack-loader-syntax: off */
import githubDark from '!!raw-loader!highlight.js/styles/github-dark.css';
/* eslint import/no-webpack-loader-syntax: off */
import intellijLight from '!!raw-loader!highlight.js/styles/intellij-light.css';
/* eslint import/no-webpack-loader-syntax: off */
import base16Darcula from '!!raw-loader!highlight.js/styles/base16/darcula.css';
/* eslint import/no-webpack-loader-syntax: off */
import base16DarkViolet from '!!raw-loader!highlight.js/styles/base16/dark-violet.css';
/* eslint import/no-webpack-loader-syntax: off */
import base16EdgeDark from '!!raw-loader!highlight.js/styles/base16/edge-dark.css';
/* eslint import/no-webpack-loader-syntax: off */
import base16EdgeLight from '!!raw-loader!highlight.js/styles/base16/edge-light.css';
/* eslint import/no-webpack-loader-syntax: off */
import pandaSyntaxDark from '!!raw-loader!highlight.js/styles/panda-syntax-dark.css';
/* eslint import/no-webpack-loader-syntax: off */
import pandaSyntaxLight from '!!raw-loader!highlight.js/styles/panda-syntax-light.css';

function fixType(styles: { [className: string]: string }) {
  return styles.toString();
}

export const Styles: { label: string, style: string, value: number }[] = [
  { label: "Github", style: github },
  { label: "Github Dark", style: githubDark},
  { label: "Android Studio", style: androidstudio},
  { label: "Arduinno Light", style: arduinnoLight},
  { label: "Atom", style: atom},
  { label: "Atom Light", style: atomLight},
  { label: "Intellij Light", style: intellijLight},
  { label: "Base16 Darcula", style: base16Darcula },
  { label: "Base16 Dark Violet", style: base16DarkViolet },
  { label: "Base16 Edge Dark", style: base16EdgeDark },
  { label: "Base16 Edge Light", style: base16EdgeLight },
  { label: "Panda Syntax Dark", style: pandaSyntaxDark },
  { label: "Panda Syntax Light", style: pandaSyntaxLight },
].map(({ label, style }, index) => ({ label, style: fixType(style), value: index }));

export function getStyle(index: number) {
  return Styles[index].style;
}
