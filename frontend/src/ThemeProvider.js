import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GraphGeneration from './GraphGeneration';

const theme = createTheme({
  palette: {
    mode: 'light', // ou 'dark', se necessário
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <GraphGeneration />
  </ThemeProvider>,
  document.getElementById('root')
);
