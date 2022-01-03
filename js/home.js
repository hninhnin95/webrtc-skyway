$(document).ready(function () {

	$("#loginUserName").text(userName);
  $("#userName").text(userName);
  $("#chat-container").css("display", "none");

  // モデル表示
  $("#showModal").on("click", function (event) {
    event.preventDefault();
    $("#modal").css("display", "block");
  });

	// ビデオボタンクリック
  $("#btnVideoCall").on("click", function (event) {
    event.preventDefault();
    video = true;
		$("#videoModal").css("display", "block");
    callMediaToRemote(window.localStorage.getItem("remoteId"));
  });

	// オーディオボタンクリック
  $("#btnAudioCall").on("click", function (event) {
    event.preventDefault();
    video = false;
		$("#audioModal").css("display", "block");
		$("#remoteUserName").text(
			userArrList.find(
				(user) => user.code == window.localStorage.getItem("remoteId")
			).name
		);
    callMediaToRemote(window.localStorage.getItem("remoteId"));
  });
});

/**
 * チャトメッセージ表示
 *
 * @param {String} name
 * @param {String} code
 * @return void
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
 * 
 * @returns void
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
 * 
 * @returns void
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
 * 
 * @returns void
 */
function logout() {
  firebaseRef.on("value", function (snapshot) {
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

	// callerのビデオストリームを取得
  const hostStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: video,
    })
    .catch(console.error);

  localVideo.muted = true;
  localVideo.srcObject = hostStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

	// 着信処理
  const mediaConnection = peer.call(remoteId, hostStream, {
    metadata: { video: video },
  });
  callMediaConnection(mediaConnection);
}
