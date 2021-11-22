import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    background: {
      default: '#303031',
      paper: '#424242',
    },
    secondary: {
      main: '#f50057',
    },
  },
})

export default theme
