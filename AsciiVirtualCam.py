from typing import Union
import numpy as np
from numba import njit
import cv2
import pyvirtualcam
import sys, getopt

@njit(fastmath=True)
def acceleratedCharIndexes(img, width, height, asciiConst, step):
	charIndexes = []
	for y in range(0, height, step):
		for x in range(0, width, step):
			charIndex = img[x, y] // asciiConst
			charIndexes.append((charIndex, (y, x)))
	return charIndexes

class VideoToAscii:
	def __init__(
	    self,
	    path: Union[int, str] = 0,
	    resolution=(720, 480),
	    fontSize=12,
	    asciiAlth=' .",:;!-~+=xmo*#W8&@',
	    asciiStep=0.8,
	    bold=5,
	):

		self.fontSize = fontSize
		self.path = path
		self.bold = bold
		self.asciiStep = asciiStep
		self.asciiAlth = asciiAlth
		self.wantedResolution = resolution
		self.asciiConst = 255 // (len(self.asciiAlth) - 1)
		self.charStep = int(self.fontSize * self.asciiStep)
		self.font = cv2.FONT_HERSHEY_SIMPLEX
		self.asciiScales = {
		    sign:
		    self.fontSize / cv2.getTextSize(sign, fontFace=self.font, fontScale=1, thickness=self.bold)[0][1]
		    for sign in self.asciiAlth
		}
		self.capture = cv2.VideoCapture(self.path)

		self.getFrame()

		self.RESOLUTION = self.frame.shape[:2]
		self.WIDTH, self.HEIGHT = self.RESOLUTION

		self.asciiFrame = np.zeros((self.WIDTH, self.HEIGHT, 3), dtype=np.uint8)

		self.cam = pyvirtualcam.Camera(width=self.HEIGHT, height=self.WIDTH, fps=30)

	def getFrame(self):
		ret, frame = self.capture.read()
		if not ret:
			exit()
		frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		frame = cv2.resize(frame, (self.wantedResolution[0], self.wantedResolution[1]),
		                   interpolation=cv2.INTER_CUBIC)
		self.frame = frame

	def drawAscii(self):
		self.asciiFrame = np.zeros((self.WIDTH, self.HEIGHT, 3), dtype=np.uint8)
		charIndexes = acceleratedCharIndexes(self.frame, self.WIDTH, self.HEIGHT, self.asciiConst, self.charStep)
		for charIndex, pos in charIndexes:
			if charIndex < len(self.asciiAlth):
				cv2.putText(self.asciiFrame,
				            self.asciiAlth[charIndex], (pos[0], pos[1] + self.fontSize),
				            self.font,
				            self.asciiScales[self.asciiAlth[charIndex]], (255, 255, 255),
				            bottomLeftOrigin=False)

	def setVirtualFrame(self):
		self.cam.send(self.asciiFrame)
		self.cam.sleep_until_next_frame()

	def draw(self):
		self.getFrame()
		self.drawAscii()
		cv2.imshow('asciiFrame', self.asciiFrame)
		self.setVirtualFrame()

	def run(self):
		while True:
			key = cv2.waitKey(1)
			if key == 27:
				break
			self.draw()
		self.capture.release()
		cv2.destroyAllWindows()

if __name__ == '__main__':
	resolution = (720, 480)
	fontSize = 12
	asciiAlth = ' .",:;!-~+=xmo*#W8&@'
	asciiStep = 0.8
	bold = 5

	argv = sys.argv[1:]

	def printUsageLine():
		print(
		    'AsciiVirtualCam.py -r <width>, <height> -f <fontSize> -a <asciiAlth> -s <asciiStep> -b <asciiBold>')

	try:
		opts, args = getopt.getopt(argv, 'hr:f:a:s:b:', ['resolution=', 'fontSize=', 'alth=', 'step=', 'bold='])
	except getopt.GetoptError:
		printUsageLine()
		sys.exit(2)
	try:
		for opt, arg in opts:
			if opt == '-h':
				printUsageLine
				sys.exit()
			elif opt in ('-r', '--resolution'):
				res = arg.split(',')
				if len(res) != 2:
					raise ValueError()
				res = list(map(int, res))
				resolution = res
			elif opt in ('-f', '--fontSize'):
				fontSize = int(arg)
			elif opt in ('-a', '--alth'):
				asciiAlth = arg
			elif opt in ('-s', '--step'):
				asciiStep = float(arg)
			elif opt in ('-b', '--bold'):
				bold = int(arg)
	except:
		printUsageLine()
		sys.exit(2)

	videoConverter = VideoToAscii(resolution=resolution,
	                              fontSize=fontSize,
	                              asciiAlth=asciiAlth,
	                              asciiStep=asciiStep,
	                              bold=bold)
	videoConverter.run()
