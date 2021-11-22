import Container from '@mui/material/Container'
import React from 'react'
import Paper from '@mui/material/Paper'
import Header from '@components/Header'
import Description from '@components/Description'
import Demo from '@components/Demo'

const App: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={1}
        sx={{
          width: '100%',
          my: 4,
          px: 4,
          py: 4,
        }}
      >
        <Header />
        <Description />
        <Demo />
      </Paper>
    </Container>
  )
}

export default App
