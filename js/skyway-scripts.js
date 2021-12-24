// ログインユーザー情報
const loginUserInfo = JSON.parse(window.localStorage.getItem("loginUserInfo"));
const localId = loginUserInfo.code;
const userName = loginUserInfo.name;
const userId = loginUserInfo.id;

// messaging
const msgContainer = document.getElementById("msg-container");
const msgContent = document.getElementById("msg-content");
const sendTrigger = document.getElementById("btnSend");

// video audio call
const localVideo = document.getElementById('js-local-stream');
const videoCloseTrigger = document.getElementById('video-close-trigger');
const audioCloseTrigger = document.getElementById('audio-close-trigger');
const remoteVideo = document.getElementById('js-remote-stream');
let video = false;

// Peerオブジェクトを作成
const peer = new Peer(localId, {
	key: window.__SKYWAY_KEY__,
	debug: 3,
});

(async function main() {
	// 初期状態に自分のIDを作成
	peer.on("open", function(id) {
		console.log("My peer ID is: " + id);
	});

	peer.on("connection", (dataConnection) => {
		openDataConnection(dataConnection)
	});

	// Register callee handler
	peer.on('call', async (mediaConnection) => {

		video = mediaConnection.metadata.video;
	
		if(video) {
			$("#videoModal").css("display", "block");
		}else {
			$("#audioModal").css("display", "block");
			$("#remoteUserName").text(
				userArrList.find(
					(user) => user.code == window.localStorage.getItem("remoteId")
				).name
			);
		}

		// カメラ映像取得
		const localStream = await navigator.mediaDevices
			.getUserMedia({
				audio: true,
				video: video,
			})
			.catch(console.error);

		// 成功時にvideo要素にカメラ映像をセットし、再生
		localVideo.muted = true;
		localVideo.srcObject = localStream;
		localVideo.playsInline = true;
		await localVideo.play().catch(console.error);

		mediaConnection.answer(localStream);
		callMediaConnection(mediaConnection);

	});

	peer.on("error", console.error);
})();

/**
 * 発信処理
 * 
 * @param {Object} dataConnection 
 * @returns void
 */
function openDataConnection(dataConnection) {

	dataConnection.once("open", async () => {
		console.log("=== DataConnection has been opened ===");
		console.log("Remote ID is: " + dataConnection.remoteId);

		$("#remote-id").text(dataConnection.remoteId);
		$("#remote-user").text(
			userArrList.find((user) => user.code == dataConnection.remoteId).name
		);
		$("#chat-container").css("display", "");
		$("#initial-st").css("display", "none");
		msgContainer.textContent = "";
		sendTrigger.addEventListener("click", onClickSend);
	});

	dataConnection.on("data", (data) => {
		msgContainer.textContent += `${userArrList
			.find((user) => user.code == dataConnection.remoteId)
			.name.charAt(0)
			.toUpperCase()}: ${data}\n`;
	});

	dataConnection.once("close", () => {
		console.log("=== DataConnection has been closed ===");
		sendTrigger.removeEventListener("click", onClickSend);
	});

	// 送信元
	function onClickSend() {
		const data = msgContent.value;
		if (data) {
			dataConnection.send(data);

			msgContainer.textContent += `${userName
				.charAt(0)
				.toUpperCase()}: ${data}\n`;
			msgContent.value = "";
		}
	}
}

/**
 * 発信処理
 * 
 * @param {Object} mediaConnection
 * @returns void
 */
function callMediaConnection(mediaConnection) {

	mediaConnection.on("stream", async (stream) => {
		// Render remote stream for caller
		remoteVideo.srcObject = stream;
		remoteVideo.playsInline = true;
		await remoteVideo.play().catch(console.error);
	});

	mediaConnection.once("close", () => {
		remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
		remoteVideo.srcObject = null;
		$("#videoModal").css("display", "none");
		$("#audioModal").css("display", "none");
	});

	videoCloseTrigger.addEventListener("click", () => {
		mediaConnection.close(true);
		$("#videoModal").css("display", "none");
	});

	audioCloseTrigger.addEventListener("click", () => {
		mediaConnection.close(true);
		$("#audioModal").css("display", "none");
	});
}
