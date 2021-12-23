// ユーザー一覧
const userList = [
	{
		id: 1,
		name: "Cherry Zaw",
		email: "cz@gmail.com",
		code: "jubZFqwed8d4TRbe",
		loginFlg: false,
	},
	{
		id: 2,
		name: "Hnin Hnin Yu",
		email: "hhy@gmail.com",
		code: "jubZFpQYd8d4TCbe",
		loginFlg: false,
	},
];

// Firebaseのセットアップと構成
const firebaseConfig = {
	apiKey: "AIzaSyBXGEaS1SwooufFLODyK4ag4n8E56DwxtI",
	authDomain: "webrtc-testing-27447.firebaseapp.com",
	databaseURL: "webrtc-testing-27447-default-rtdb.firebaseio.com",
	projectId: "webrtc-testing-27447",
	storageBucket: "webrtc-testing-27447.appspot.com",
	messagingSenderId: "1082390926029",
	appId: "1:1082390926029:web:975cf24a90a8234b8b4f84",
	measurementId: "G-RSHEZ8PJ73",
};

// Firebase Realtime Database ユーザーリストをuserArrList[]に追加する
var userArrList = [];
firebase.initializeApp(firebaseConfig);
var firebaseRef = firebase.database().ref("user");
firebaseRef.on("value", function(snapshot) {
	userArrList = Object.values(snapshot.val());
});
