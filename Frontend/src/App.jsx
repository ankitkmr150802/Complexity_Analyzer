// In src/App.jsx

import { useState, createContext, useContext, useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-java';
import Markdown from 'react-markdown';
import axios from 'axios';

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import './App.css';

const ColorModeContext = createContext({ toggleColorMode: () => {} });
const sampleJavaCode = `public class PrimeChecker {\n    // Function to check if a number is prime\n    public static boolean isPrime(int num) {\n        if (num <= 1) {\n            return false;\n        }\n        for (int i = 2; i * i <= num; i++) {\n            if (num % i == 0) {\n                return false;\n            }\n        }\n        return true;\n    }\n}`;

function App() {
  const [code, setCode] = useState(sampleJavaCode);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  async function reviewCode() {
    setIsLoading(true);
    setReview('');
    try {
      const response = await axios.post('https://complexity-analyzer-backend.onrender.com/ai/get-review', { code });
      setReview(response.data);
    } catch (error) {
      console.error("Error during code review:", error);
      setReview("### [ CONNECTION ERROR ]\n> Could not connect to the review service.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box className="main-container">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" className="app-title">AlgoPulse AI 👁️</Typography>
        <IconButton onClick={toggleColorMode} color="inherit" title={`Toggle theme`}>
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Stack>
      <Box className="content-grid">
        <Box className="panel editor-panel">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => prism.highlight(code, prism.languages.java, 'java')}
            padding={16}
            className="code-editor"
          />
          <Button variant="contained" onClick={reviewCode} disabled={isLoading} size="large" startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />} className="review-button">
            {isLoading ? 'Analyzing...' : 'Review Code'}
          </Button>
        </Box>
        <Box className="panel output-panel">
          {isLoading && (<Box className="placeholder-text"><CircularProgress color="inherit" /><Typography sx={{ mt: 2 }}>Analyzing...</Typography></Box>)}
          {!isLoading && !review && (<Box className="placeholder-text"><Typography variant="h6">Awaiting Analysis</Typography><Typography color="text.secondary">Your code review will appear here.</Typography></Box>)}
          {review && (<div className="markdown-content"><Markdown>{review}</Markdown></div>)}
        </Box>
      </Box>
    </Box>
  );
}

export default function ToggleColorMode() {
  const [mode, setMode] = useState('dark');
  const colorMode = useMemo(() => ({ toggleColorMode: () => { setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light')); }, mode, }), [mode]);
  const theme = useMemo(() => createTheme({ palette: { mode }, typography: { fontFamily: 'Inter, sans-serif' } }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>
    </ColorModeContext.Provider>
  );
}
