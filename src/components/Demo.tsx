import React from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront'
import Box from '@mui/material/Box'

const MyStyledVideo = styled('video')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: '100%',
}))

const Demo: React.FC = () => {
  return (
    <Box>
      <Typography variant="h3" my={2} textAlign="center">
        DEMO
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <MyStyledVideo autoPlay playsInline></MyStyledVideo>
        <Button
          size="large"
          variant="contained"
          startIcon={<VideoCameraFrontIcon />}
        >
          Start
        </Button>
      </Box>
    </Box>
  )
}

export default Demo
