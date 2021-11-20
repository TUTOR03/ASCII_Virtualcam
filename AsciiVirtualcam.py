from typing import Union
import pygame as pg
from numba import njit
import cv2
import pyvirtualcam

@njit(fastmath=True)
def acceleratedCharIndexes(img, width, height, asciiConst, step):
	charIndexes = []
	for x in range(0, width, step):
		for y in range(0, height, step):
			charIndex = img[x, y] // asciiConst
			charIndexes.append((charIndex, (x, y)))
	return charIndexes

class VideoToAscii:
	def __init__(
	    self,
	    path: Union[int, str] = 0,
	    fontSize=12,
	    asciiAlth=' .",:;!~+-xmoa*#W8&@',
	    asciiStep=0.5,
	    bold=False,
	):
		pg.init()

		self.fontSize = fontSize
		self.path = path
		self.bold = bold
		self.asciiStep = asciiStep
		self.asciiAlth = asciiAlth
		self.asciiConst = 255 // (len(self.asciiAlth) - 1)
		self.charStep = int(self.fontSize * self.asciiStep)

		self.capture = cv2.VideoCapture(self.path, cv2.CAP_DSHOW)

		self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, 900)
		self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 700)

		self.getFrame()

		self.RESOLUTION = self.frame.shape[:2]
		self.WIDTH, self.HEIGHT = self.RESOLUTION

		self.cam = pyvirtualcam.Camera(width=self.WIDTH, height=self.HEIGHT, fps=30)

		self.font = pg.font.SysFont('Сourier', self.fontSize, bold)

		self.prerenderedAsciiChars = [self.font.render(char, False, '#ffffff') for char in self.asciiAlth]

		self.surface = pg.display.set_mode(self.RESOLUTION)
		self.clock = pg.time.Clock()

	def getFrame(self):
		ret, frame = self.capture.read()
		if not ret:
			exit()
		frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		self.frame = cv2.transpose(frame)

	def drawPG(self):
		charIndexes = acceleratedCharIndexes(self.frame, self.WIDTH, self.HEIGHT, self.asciiConst, self.charStep)
		for charIndex, pos in charIndexes:
			if charIndex < len(self.prerenderedAsciiChars):
				self.surface.blit(self.prerenderedAsciiChars[int(charIndex)], pos)

	def setVirtualFrame(self):
		virtualFrame = pg.surfarray.array3d(self.surface)
		virtualFrame = cv2.transpose(virtualFrame)
		self.cam.send(virtualFrame)
		self.cam.sleep_until_next_frame()

	def draw(self):
		self.getFrame()
		self.surface.fill('#000000')
		self.drawPG()
		self.setVirtualFrame()

	def run(self):
		while True:
			for event in pg.event.get():
				if event.type == pg.QUIT or event.type == pg.KEYDOWN and event.key == pg.K_ESCAPE:
					exit()

			self.draw()
			pg.display.set_caption(f'{int(self.clock.get_fps())}fps')
			pg.display.flip()
			self.clock.tick(30)

if __name__ == '__main__':
	videoConverter = VideoToAscii(path='./video_test.mp4')
	videoConverter.run()
