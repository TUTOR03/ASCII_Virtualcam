import React from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

const MyStyledImg = styled('img')(() => ({
  objectFit: 'contain',
  width: '100%',
  height: '100%',
}))

const Header: React.FC = () => {
  return (
    <Box>
      <Typography variant="h2" align="center">
        ASCII Virtualcam
        <Divider />
      </Typography>
      <Stack direction="row" justifyContent="center" mt={1} spacing={2}>
        <Box
          sx={{
            width: '10%',
            minWidth: '70px',
            minHeight: '40px',
          }}
        >
          <MyStyledImg
            src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54"
            alt="Python"
          />
        </Box>
        <Box
          sx={{
            width: '10%',
            minWidth: '70px',
            minHeight: '40px',
          }}
        >
          <MyStyledImg
            src="https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white"
            alt="OpenCV"
          />
        </Box>
        <Box
          sx={{
            width: '10%',
            minWidth: '70px',
            minHeight: '40px',
          }}
        >
          <MyStyledImg
            src="https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white"
            alt="NumPy"
          />
        </Box>
        <Box
          sx={{
            width: '10%',
            minWidth: '70px',
            minHeight: '40px',
          }}
        >
          <MyStyledImg
            src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi"
            alt="FastAPI"
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default Header
