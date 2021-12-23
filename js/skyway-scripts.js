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
const closeTrigger = document.getElementById('js-close-trigger');
const remoteVideo = document.getElementById('js-remote-stream');

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

	// connection openイベント
	peer.on("connection", (dataConnection) => {

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
			sendTrigger.addEventListener("click", onClickRemoteSend);
		});

		dataConnection.on("data", (data) => {
			msgContainer.textContent += `${userArrList
				.find((user) => user.code == dataConnection.remoteId)
				.name.charAt(0)
				.toUpperCase()}: ${data}\n`;
		});

		dataConnection.once("close", () => {
			console.log("=== DataConnection has been closed ===");
			sendTrigger.removeEventListener("click", onClickRemoteSend);
		});

		// 送信元
		function onClickRemoteSend() {
			const data = msgContent.value;
			dataConnection.send(data);

			msgContainer.textContent += `${userName
				.charAt(0)
				.toUpperCase()}: ${data}\n`;
			msgContent.value = "";
		}
	});

	// Register callee handler
	peer.on('call', async (mediaConnection) => {

		const localStream = await navigator.mediaDevices
			.getUserMedia({
				audio: true,
				video: true,
			})
			.catch(console.error);

		// Render local stream
		localVideo.muted = true;
		localVideo.srcObject = localStream;
		localVideo.playsInline = true;
		await localVideo.play().catch(console.error);

		$("#videoModal").css("display", "block");
		mediaConnection.answer(localStream);

		mediaConnection.on('stream', async stream => {

			// Render remote stream for callee
			remoteVideo.srcObject = stream;
			remoteVideo.playsInline = true;
			await remoteVideo.play().catch(console.error);
		});

		mediaConnection.once('close', () => {
			remoteVideo.srcObject.getTracks().forEach(track => track.stop());
			remoteVideo.srcObject = null;			
			$("#videoModal").css("display", "none");
		});

		closeTrigger.addEventListener('click', () => {
			mediaConnection.close(true);
			$("#videoModal").css("display", "none");
		});
	});

	peer.on("error", console.error);
})();
