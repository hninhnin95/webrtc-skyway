$(document).ready(function() {

	// 初期状態
	checkAndShowActiveUserList();

	$("#loginUserName").text(userName);
	$("#userName").text(userName);
	$("#chat-container").css("display", "none");

	// モデル表示
	$("#showModal").on("click", function(event) {
		event.preventDefault();
		$("#modal").css("display", "block");
	});

	$("#btnVideoCall").on("click", function(event) {
		event.preventDefault();
		video = true;
		callMediaToRemote(window.localStorage.getItem("remoteId"),);
	});

	$("#btnAudioCall").on("click", function(event) {
		event.preventDefault();
		video = false;
		callMediaToRemote(window.localStorage.getItem("remoteId"));
	});
});

/**
 * ログインしたユーザーをチャックとユーザーステータスチェック
 */
function checkAndShowActiveUserList() {
	if (userId) {
		firebaseRef.on("value", function(snapshot) {
			var arrList = Object.values(snapshot.val());
			var index = arrList.findIndex((user) => user.id == userId);
			arrList.splice(index, 1);
			// アクティブユーザー表示
			for (let i = 0; i < arrList.length; i++) {
				if (arrList[i].loginFlg == true) {
					window.localStorage.setItem("remoteId", arrList[i].code);
					$("#col-l-body").append(
						`<div class="user" onclick="showUserChat('${arrList[i].name}', '${arrList[i].code}')">
							<label id="lbltext">${arrList[i].name}</label>
							<p class="m-0 p-0">Active</p>
							<div>`
					);
				}
			}
		});
	} else {
		window.location.href = "login.html";
	}
}

/**
 * チャトメッセージ表示
 * 
 * @param {String} name 
 * @param {$tring} code 
 */
function showUserChat(name, code) {
	console.log("Remote ID is: " + code);
	$("#remote-id").text(code);
	$("#remote-user").text(name);
	$("#chat-container").css("display", "");
	$("#initial-st").css("display", "none");
	// TODO: multiple users
	// msgContainer.textContent = ""; 
	connectDataMediaToRemote(code, name);
}

/**
 * ダークモード変化
 */
function darkMode() {
	var element = document.body;
	element.className = "dark-mode";
	$(".btn").css("color", "#fff");
	$("#modal").css("display", "none");
	$(".modal-content").css("background", "#000");
	$(".modal-content button").css("color", "#fff");
	$(".modal-content button i").css("color", "#fff");
}

/**
 * ライトモード変化
 */
function lightMode() {
	var element = document.body;
	element.className = "light-mode";
	$(".btn").css("color", "#000");
	$("#modal").css("display", "none");
	$(".modal-content").css("background", "#fff");
	$(".modal-content button").css("color", "#000");
	$(".modal-content button i").css("color", "#000");
}

/**
 * ログアウト
 */
function logout() {
	firebaseRef.on("value", function(snapshot) {
		var index = Object.values(snapshot.val()).findIndex(
			(user) => user.id == loginUserInfo.id
		);
		firebase
			.database()
			.ref("user/" + Object.keys(snapshot.val())[index])
			.update({
				loginFlg: false,
			});
	});
	window.localStorage.clear();
	window.location.href = "login.html";
}

/**
 *  接続元
 *
 * @param {String} remoteId
 * @returns void
 */
async function connectDataMediaToRemote(remoteId) {
	if (!peer.open) {
		return;
	}

	// 接続開始
	const dataConnection = peer.connect(remoteId);
	openDataConnection(dataConnection);
}

/**
 *  接続元
 *
 * @param {String} remoteId
 * @returns void
 */
async function callMediaToRemote(remoteId) {
	if (!peer.open) {
		return;
	}
	
	$("#videoModal").css("display", "block");
	const hostStream = await navigator.mediaDevices
		.getUserMedia({
			audio: true,
			video: video,
		})
		.catch(console.error);

	// Render local stream
	localVideo.muted = true;
	localVideo.srcObject = hostStream;
	localVideo.playsInline = true;
	await localVideo.play().catch(console.error);

	const mediaConnection = peer.call(remoteId, hostStream, {metadata:{video: video}});
	callMediaConnection(mediaConnection);
}
