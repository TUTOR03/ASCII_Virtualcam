from dotenv import load_dotenv
import os

load_dotenv()

HOST = os.getenv('HOST')
PORT = int(os.getenv('PORT'))
DOCKER_OUT_PORT = int(os.getenv('DOCKER_OUT_PORT'))
IS_DEV = os.getenv('TYPE') == 'DEVELOPMENT'