from fastapi import FastAPI, Request
from fastapi.params import Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

import os
import uvicorn
import asyncio
from av import VideoFrame

from aiortc import RTCSessionDescription, MediaStreamTrack
from aiortc.rtcpeerconnection import RTCPeerConnection
from aiortc.contrib.media import MediaRelay

from schemas import Offer

from AsciiFrameConverter import AsciiFrameConverter

ROOT = os.path.dirname(__file__)
personConnections = set()
relay = MediaRelay()

app = FastAPI()

frameConverter = AsciiFrameConverter()

app.mount('/static', StaticFiles(directory='static'), name='static')

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
		# asciiFrame = frameConverter.convertFrame(frame.to_ndarray(format='bgr24'))

		# newFrame = VideoFrame.from_ndarray(asciiFrame, format='bgr24')
		# newFrame.pts = frame.pts
		# newFrame.time_base = frame.time_base
		# return newFrame
		return frame

@app.post('/offer')
async def offer(offerParams: Offer = Body(...)):
	offer = RTCSessionDescription(sdp=offerParams.sdp, type=offerParams.type)

	personConnection = RTCPeerConnection()
	personConnections.add(personConnection)

	@personConnection.on('datachannel')
	def onDatachannel(channel):
		@channel.on('message')
		def on_message(message):
			if isinstance(message, str) and message.startswith('ping'):
				channel.send('pong' + message[4:])

	@personConnection.on('connectionstatechange')
	async def onConnectionStateChange():
		if personConnection.connectionState == 'failed' or personConnection.connectionState == 'closed':
			await personConnection.close()
			personConnections.discard(personConnection)

	@personConnection.on('track')
	def onTrack(track):
		if track.kind == 'video':
			personConnection.addTrack(VideoTransformTrack(relay.subscribe(track)))

	await personConnection.setRemoteDescription(offer)

	answer = await personConnection.createAnswer()
	await personConnection.setLocalDescription(answer)

	return {'sdp': personConnection.localDescription.sdp, 'type': personConnection.localDescription.type}

@app.on_event("shutdown")
async def on_shutdown():
	closeTasks = [personConnection.close() for personConnection in personConnections]
	await asyncio.gather(*closeTasks)
	personConnections.clear()

if __name__ == '__main__':
	uvicorn.run('server:app', host='0.0.0.0', port=3000, reload=True)
