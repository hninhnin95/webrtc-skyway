/**
 * ログイン
 *
 * @returns void
 */
function login() {
  let emailAddress = $("input[id=mailAddress]").val();
  let password = $("input[id=password]").val();

  if (validateEmail(emailAddress)) {
		var loginUserInfo = checkUser(emailAddress);

    if (loginUserInfo) {

      if (password !== null && password.trim() !== "") {

        // ログインフラグ変更
        firebaseRef.on("value", function (snapshot) {
          var index = Object.values(snapshot.val()).findIndex(
            (user) => user.email == emailAddress
          );
          firebase
            .database()
            .ref("user/" + Object.keys(snapshot.val())[index])
            .update({
              loginFlg: true,
            });
        });
       
				window.localStorage.setItem('loginUserInfo', JSON.stringify(loginUserInfo));
        window.location.href = "home.html";
				
      } else {
        alert("パスワードを入力してください ");
      }
    } else {
      alert("ユーザーは存在しません ");
    }
  } else {
    alert("有効なメールアドレスを入力してください ");
  }
}

/**
 * メールアドレス形式を確認する
 *
 * @param {String} emailAddress
 * @returns {boolean}
 */
function validateEmail(emailAddress) {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailAddress.match(mailformat) ? true : false;
}

/**
 * ユーザーチャック
 *
 * @param {String} emailAddress
 * @returns {boolean}
 */
function checkUser(emailAddress) {
	return userArrList.find((user) => user.email == emailAddress);
}
