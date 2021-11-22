from typing import Union
import numpy as np
from numba import njit
import cv2

@njit(fastmath=True)
def acceleratedCharIndexes(img, width, height, asciiConst, step):
	charIndexes = []
	for y in range(0, height, step):
		for x in range(0, width, step):
			charIndex = img[x, y] // asciiConst
			charIndexes.append((charIndex, (y, x)))
	return charIndexes

class AsciiFrameConverter:
	def __init__(
	    self,
	    resolution=(640, 480),
	    fontSize=10,
	    asciiAlth=' .",:;!~+-xmo*#W8&@',
	    asciiStep=1,
	    bold=2,
	):

		self.fontSize = fontSize
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

	def convertFrame(self, frame):
		frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		# print(frame.shape)
		# frame = cv2.resize(frame, (self.wantedResolution[0], self.wantedResolution[1]),
		#                    interpolation=cv2.INTER_CUBIC)
		asciiFrame = np.zeros((self.wantedResolution[1], self.wantedResolution[0], 3), dtype=np.uint8)
		charIndexes = acceleratedCharIndexes(frame, self.wantedResolution[1], self.wantedResolution[0],
		                                     self.asciiConst, self.charStep)
		for charIndex, pos in charIndexes:
			if charIndex < len(self.asciiAlth):
				cv2.putText(asciiFrame,
				            self.asciiAlth[charIndex], (pos[0], pos[1] + self.fontSize),
				            self.font,
				            self.asciiScales[self.asciiAlth[charIndex]], (255, 255, 255),
				            bottomLeftOrigin=False)
		return asciiFrame
