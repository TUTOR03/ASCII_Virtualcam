from fastapi import FastAPI, Request
from fastapi.params import Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

import os
import uvicorn
import asyncio
from av import VideoFrame

from aiortc import RTCSessionDescription, MediaStreamTrack
from aiortc.rtcpeerconnection import RTCPeerConnection
from aiortc.contrib.media import MediaRelay
from config import HOST, IS_DEV, PORT

from schemas import Offer

from AsciiFrameConverter import AsciiFrameConverter

ROOT = os.path.dirname(__file__)
personConnections = set()
relay = MediaRelay()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

frameConverter = AsciiFrameConverter()

app.mount('/static', StaticFiles(directory='./build/dist'), name='static')

templates = Jinja2Templates(directory='templates')

@app.get('/test')
def test():
	return {'ok': 'works'}

@app.get('/', response_class=HTMLResponse)
def index(req: Request):
	return templates.TemplateResponse('index.html', {'request': req})

class VideoTransformTrack(MediaStreamTrack):
	kind = 'video'

	def __init__(self, track):
		super().__init__()
		self.track = track

	async def recv(self):
		frame = await self.track.recv()
		asciiFrame = frameConverter.convertFrame(frame.to_ndarray(format='bgr24'))

		newFrame = VideoFrame.from_ndarray(asciiFrame, format='bgr24')
		newFrame.pts = frame.pts
		newFrame.time_base = frame.time_base
		return newFrame

@app.post('/offer')
async def offer(offerParams: Offer = Body(...)):
	if len(personConnections) >= 1:
		return {'status': 'error', 'error': 'Maximum number of connections reached'}
	offer = RTCSessionDescription(sdp=offerParams.sdp, type=offerParams.type)

	personConnection = RTCPeerConnection()
	personConnections.add(personConnection)

	@personConnection.on('connectionstatechange')
	async def onConnectionStateChange():
		if personConnection.connectionState == 'failed':
			await personConnection.close()
			personConnections.discard(personConnection)

	@personConnection.on('track')
	def onTrack(track):
		if track.kind == 'video':
			personConnection.addTrack(VideoTransformTrack(relay.subscribe(track)))

	await personConnection.setRemoteDescription(offer)

	answer = await personConnection.createAnswer()
	await personConnection.setLocalDescription(answer)

	return {
	    'status': 'ok',
	    'sdp': personConnection.localDescription.sdp,
	    'type': personConnection.localDescription.type
	}

@app.on_event("shutdown")
async def on_shutdown():
	closeTasks = [personConnection.close() for personConnection in personConnections]
	await asyncio.gather(*closeTasks)
	personConnections.clear()

if __name__ == '__main__':
	uvicorn.run('server:app', host=HOST, port=PORT, reload=IS_DEV)
