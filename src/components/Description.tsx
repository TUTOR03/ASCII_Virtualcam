import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

const Description: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4">About</Typography>
      <Typography variant="subtitle2">
        This is a small python script that converts video from your camera or
        video file into ascii art and broadcasts it through the virtual camera
        based on OBS
      </Typography>
      <Divider />
      <Typography mt={2} variant="h4">
        How to use
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="1. Be sure you have OBS installed" />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="2. Create python virtual enviroment with:
          python3 -m venv env"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="3. Activate the virtual enviroment: source
          env/bin/activate"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="4. Install all dependencies: pip install -r
          requirments.txt"
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="5. Start the script: python3 AsciiVirtualcam.py -r <width>, <height> -f <fontSize> -a <asciiAlth> -s <asciiStep> -b <asciiBold>" />
        </ListItem>
        <ListItem>
          <ListItemText primary="6. Profit!!!" />
        </ListItem>
      </List>
      <Divider />
    </Box>
  )
}

export default Description
