<div align="center">
  <h2>ASCII Virtualcam</h2>
  <p>
    <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" alt="Python" />
    <img src="https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white" alt="OpenCV"/>
    <img src="https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white" alt="NumPy"/>
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)" alt="FastAPI">
  </p>
</div>

### About

This is a small python script that converts video from your camera or video file into ascii art and broadcasts it through the virtual camera based on OBS

### How to use

1. Be sure you have OBS installed
2. Create python virtual enviroment with: `python3 -m venv env`
3. Activate the virtual enviroment: `source env/bin/activate`
4. Install all dependencies: `pip install -r requirements.txt`
5. Start the script:<br/>`python3 AsciiVirtualcam.py -r <width>, <height> -f <fontSize> -a <asciiAlth> -s <asciiStep> -b <asciiBold>`
7. Profit!!! <br/><br/>
   ![Profit example](../assets/example.jpg?raw=true)

### Demo

You can check demo of this script here:

You can find source of this web application on branch: [`fastAPI_demo`](https://github.com/TUTOR03/ASCII_Virtualcam/tree/fastAPI_demo)
