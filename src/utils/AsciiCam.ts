import { useRef, useState } from 'react'
import freeice from 'freeice'

const useAsciiCam = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const localStream = useRef<MediaStream | null>(null)

  const [videoState, setVideoState] = useState<boolean>(false)
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false)

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      // iceServers: freeice(),
    })

    peerConnection.current.addEventListener('connectionstatechange', () => {
      if (peerConnection.current?.connectionState === 'failed') {
        stopAsciiCam()
      }
    })

    peerConnection.current.addEventListener('track', (event) => {
      if (event.track.kind === 'video' && videoElementRef.current) {
        videoElementRef.current.srcObject = event.streams[0]
      }
    })
  }

  const createOffer = async () => {
    if (peerConnection.current) {
      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      await new Promise((resolve) => {
        if (peerConnection.current?.iceGatheringState === 'complete') {
          resolve(null)
        } else {
          const waitICEGathering = () => {
            if (peerConnection.current?.iceGatheringState === 'complete') {
              peerConnection.current?.removeEventListener(
                'icegatheringstatechange',
                waitICEGathering
              )
              resolve(null)
            }
          }
          peerConnection.current?.addEventListener(
            'icegatheringstatechange',
            waitICEGathering
          )
        }
      })

      const desc = peerConnection.current.localDescription
      const res = await fetch('/offer', {
        method: 'POST',
        body: JSON.stringify({
          sdp: desc?.sdp,
          type: desc?.type,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const resJSON = await res.json()
      await peerConnection.current.setRemoteDescription(resJSON)
    }
  }

  const stopAsciiCam = () => {
    setIsLoadingState(true)
    if (peerConnection.current) {
      peerConnection.current.close()
    }
    peerConnection.current = null
    if (
      videoElementRef.current &&
      videoElementRef.current.srcObject instanceof MediaStream
    ) {
      const stream = videoElementRef.current.srcObject
      stream.getTracks().forEach((track) => {
        track.stop()
      })

      videoElementRef.current.srcObject = null
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        track.stop()
      })
      localStream.current = null
    }
    setVideoState(false)
    setIsLoadingState(false)
  }

  const startAsciiCam = async () => {
    setIsLoadingState(true)
    setVideoState(true)
    try {
      createPeerConnection()
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 920,
          height: 518,
        },
      })

      localStream.current.getTracks().forEach((track) => {
        if (peerConnection.current) {
          if (localStream.current)
            peerConnection.current.addTrack(track, localStream.current)
        }
      })
      await createOffer()
      setIsLoadingState(false)
    } catch (error) {
      stopAsciiCam()
      alert(error)
    }
  }

  return {
    startAsciiCam,
    stopAsciiCam,
    videoState,
    isLoadingState,
    videoElementRef,
  }
}

export default useAsciiCam
