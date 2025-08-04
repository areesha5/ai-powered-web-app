import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    text: string;
    inputBg: string;
    panelBg: string;
  }
}