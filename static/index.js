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
      // if (codec !== "default") {
      //   offer.sdp = sdpFilterCodec("video", codec, offer.sdp)
      // }

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
