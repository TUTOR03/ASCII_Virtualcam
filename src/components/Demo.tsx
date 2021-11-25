import React from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront'
import CancelIcon from '@mui/icons-material/Cancel'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import useAsciiCam from '@utils/AsciiCam'

const MyStyledVideo = styled('video')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: 'calc(100vw - 112px)',
  maxWidth: '920px',
  height: 'calc(56.25vw - 63px)',
  maxHeight: '518px',
  transform: 'scaleX(-1)',
}))

const Demo: React.FC = () => {
  const {
    startAsciiCam,
    stopAsciiCam,
    videoState,
    isLoadingState,
    videoElementRef,
  } = useAsciiCam()

  return (
    <Box>
      <Typography variant="h3" my={2} textAlign="center">
        DEMO
      </Typography>
      <Typography variant="subtitle2" my={2} textAlign="center">
        *Sorry, but this demo can work only with one person at a time, because
        my server is really slow :)
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <MyStyledVideo
            ref={videoElementRef}
            autoPlay
            playsInline
          ></MyStyledVideo>
          {isLoadingState && (
            <CircularProgress
              sx={{
                position: 'absolute',
                left: 'calc(50% - 20px)',
                top: 'calc(50% - 20px)',
              }}
            />
          )}
        </Box>
        {!videoState ? (
          <Button
            sx={{
              width: 'calc(100vw - 112px)',
              maxWidth: '920px',
            }}
            disabled={isLoadingState}
            size="large"
            variant="contained"
            startIcon={<VideoCameraFrontIcon />}
            onClick={startAsciiCam}
          >
            Start
          </Button>
        ) : (
          <Button
            sx={{
              width: 'calc(100vw - 112px)',
              maxWidth: '920px',
            }}
            disabled={isLoadingState}
            size="large"
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={stopAsciiCam}
          >
            Stop
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default Demo
