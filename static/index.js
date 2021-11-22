let personConnection = null
let dataChannel = null
let dataChannelInterval = null

function createPeerConnection() {
  const config = {
    sdpSemantics: "unified-plan",
  }

  if (document.getElementById("use-stun").checked) {
    config.iceServers = [{ urls: ["stun:stun.l.google.com:19302"] }]
  }

  personConnection = new RTCPeerConnection(config)

  personConnection.addEventListener("track", function (event) {
    if (event.track.kind == "video") {
      document.getElementById("video").srcObject = event.streams[0]
    }
  })
}

function negotiate() {
  return personConnection
    .createOffer()
    .then(function (offer) {
      return personConnection.setLocalDescription(offer)
    })
    .then(function () {
      // wait for ICE gathering to complete
      return new Promise(function (resolve) {
        if (personConnection.iceGatheringState === "complete") {
          resolve()
        } else {
          function checkState() {
            if (personConnection.iceGatheringState === "complete") {
              personConnection.removeEventListener(
                "icegatheringstatechange",
                checkState
              )
              resolve()
            }
          }
          personConnection.addEventListener(
            "icegatheringstatechange",
            checkState
          )
        }
      })
    })
    .then(function () {
      const offer = personConnection.localDescription
      let codec

      codec = document.getElementById("video-codec").value
      offer.sdp = sdpFilterCodec("video", "VP8/90000", offer.sdp)

      return fetch("/offer", {
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    })
    .then(function (response) {
      return response.json()
    })
    .then(function (answer) {
      return personConnection.setRemoteDescription(answer)
    })
    .catch(function (e) {
      alert(e)
    })
}

function start() {
  document.getElementById("start").style.display = "none"
  createPeerConnection()

  let timeStart = null

  function currentStamp() {
    if (timeStart === null) {
      timeStart = new Date().getTime()
      return 0
    } else {
      return new Date().getTime() - timeStart
    }
  }

  const constraints = {
    video: false,
  }

  if (document.getElementById("use-video").checked) {
    let resolution = document.getElementById("video-resolution").value
    if (resolution) {
      resolution = resolution.split("x")
      constraints.video = {
        width: parseInt(resolution[0], 0),
        height: parseInt(resolution[1], 0),
      }
    } else {
      constraints.video = true
    }
  }

  if (constraints.video) {
    document.getElementById("media").style.display = "block"
    navigator.mediaDevices.getUserMedia(constraints).then(
      function (stream) {
        stream.getTracks().forEach(function (track) {
          personConnection.addTrack(track, stream)
        })
        return negotiate()
      },
      function (err) {
        alert("Could not acquire media: " + err)
      }
    )
  } else {
    negotiate()
  }

  document.getElementById("stop").style.display = "inline-block"
}

function stop() {
  document.getElementById("stop").style.display = "none"

  if (personConnection.getTransceivers) {
    personConnection.getTransceivers().forEach(function (transceiver) {
      if (transceiver.stop) {
        transceiver.stop()
      }
    })
  }

  personConnection.getSenders().forEach(function (sender) {
    sender.track.stop()
  })

  setTimeout(function () {
    personConnection.close()
  }, 500)
}

function sdpFilterCodec(kind, codec, realSdp) {
  let allowed = []
  const rtxRegex = new RegExp("a=fmtp:(\\d+) apt=(\\d+)\r$")
  const codecRegex = new RegExp("a=rtpmap:([0-9]+) " + escapeRegExp(codec))
  const videoRegex = new RegExp("(m=" + kind + " .*?)( ([0-9]+))*\\s*$")

  const lines = realSdp.split("\n")

  let isKind = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("m=" + kind + " ")) {
      isKind = true
    } else if (lines[i].startsWith("m=")) {
      isKind = false
    }

    if (isKind) {
      let match = lines[i].match(codecRegex)
      if (match) {
        allowed.push(parseInt(match[1]))
      }

      match = lines[i].match(rtxRegex)
      if (match && allowed.includes(parseInt(match[2]))) {
        allowed.push(parseInt(match[1]))
      }
    }
  }

  const skipRegex = "a=(fmtp|rtcp-fb|rtpmap):([0-9]+)"
  let sdp = ""

  isKind = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("m=" + kind + " ")) {
      isKind = true
    } else if (lines[i].startsWith("m=")) {
      isKind = false
    }

    if (isKind) {
      let skipMatch = lines[i].match(skipRegex)
      if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
        continue
      } else if (lines[i].match(videoRegex)) {
        sdp += lines[i].replace(videoRegex, "$1 " + allowed.join(" ")) + "\n"
      } else {
        sdp += lines[i] + "\n"
      }
    } else {
      sdp += lines[i] + "\n"
    }
  }

  return sdp
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
