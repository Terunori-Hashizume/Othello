//オセロゲームのプロトタイプ
var OthelloGame = function() {
  var board = new Array(10); //盤兵を含む
  for (var i = 0; i < 10; i++) {
    var row = new Array(10);
    board[i] = row;
    for (var j = 0; j < 10; j++) {
      if (i == 0 || i == 9 || j == 0 || j == 9) {
        board[i][j] = 'edge'; //番兵
      }
    }
  }
  //初めから置かれているディスク
  board[4][4] = 'w';
  board[4][5] = 'b';
  board[5][4] = 'b';
  board[5][5] = 'w';

  this.board = board;
  this.nextColor = 'w'; //先手は白
  this.numOfBlack = 2;
  this.numOfWhite = 2;
};

OthelloGame.prototype = {
  //ディスクを置けるかチェック、裏返すかどうかはdoFlipで決定
  checkAndFlip : function (y, x, colorOfP1, doFlip) {
    //マスが空いていなければ置けるわけがない
    if(this.board[y][x]) { return false; }

    //探索する方向ベクトルと、相手の色
    var d = [[1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1], [0,-1],[1,-1]];
    var colorOfP2 = (colorOfP1 == 'b') ? 'w' : 'b';

    //裏返すディスクがあるか
    var anyDiscsToFlip = false;
    for (var i = 0; i < d.length; i++) {
      var [dy, dx] = [d[i][1], d[i][0]];
      //隣のマスが違う色だったら
      if (this.board[y + dy][x + dx] == colorOfP2) {
        var successing = true;
        var n = 1;
        while (successing) {
          n += 1;
          //連続が途切れたとき
          if (this.board[y + n*dy][x + n*dx] != colorOfP2) {
            //相手の色が連続したのち自分の色になったとき
            if(this.board[y + n*dy][x + n*dx] == colorOfP1) {
              anyDiscsToFlip = true;
              if (doFlip) { //ディスクを裏返す(ディスクの枚数を更新)
                for(var k = 1; k < n; k++) {
                  this.board[y + k*dy][x + k*dx] = colorOfP1;
                  var afterColor = (colorOfP2 == 'b') ? '#ffffff' : '#000000';
                  var targetDisc = document.getElementById('disc-' + (y + k*dy) + '-' + (x + k*dx));
                  targetDisc.setAttribute('style', 'background-color: ' + afterColor);
                  if (colorOfP1 == 'w') {
                    this.numOfWhite += 1;
                    this.numOfBlack -= 1;
                  } else {
                    this.numOfWhite -= 1;
                    this.numOfBlack += 1;
                  }
                }
              }
            }
            successing = false;
          }
        }
      }
    }
    return anyDiscsToFlip;
  },

  //一枚のディスクをオセロ盤に置く、挟んだディスクを裏返す
  putDisc : function(selectedCell) {
      var id = selectedCell.id.split('-')
      var x = Number(id[2]);
      var y = Number(id[1]);

      //裏返せるなら裏返す
      var flipped = this.checkAndFlip(y, x, this.nextColor, true);
      //裏返したとき
      if (flipped) {
        this.board[y][x] = this.nextColor;
        //置いた一枚を表示(裏返す作業は上の代入の過程でなされる)
        this.showDisc(y, x);
        if (this.nextColor == 'w') {
          this.numOfWhite += 1;
        } else {
          this.numOfBlack += 1;
        }

        this.nextColor = (this.nextColor == 'b') ? 'w' : 'b';
        this.showWhichTurn();
        this.showDiscNums();
      }
  },

  //置けるマスの色を変え、置けるならtrueを返す
  changeCellColor : function(y, x) {
    var cell = document.getElementById('cell-' + y + '-' + x);
    //置ける場所を強調
    var cellStatus = this.checkAndFlip(y, x, this.nextColor, false);
    var cellColor = cellStatus ? '#006400' : 'green';
    cell.setAttribute('style', 'background-color: ' + cellColor);

    return cellStatus;
  },

  //置けるマスがあるかチェック
  checkAllCells : function() {
    var canPutDisc = false;
    for(var i = 1; i <= 8; i++) {
      for(var j = 1; j <= 8; j++) {
        var cellStatus = this.changeCellColor(i, j);
        canPutDisc = canPutDisc || cellStatus;
      }
    }
    return canPutDisc
  },

  //パスするかどうかの判定、ゲーム終了の判定
  judge : function () {
    //置けるマスがないならパス（色を相手の色に変える）
    if (!this.checkAllCells() && this.numOfWhite + this.numOfBlack != 64) {
      this.nextColor = (this.nextColor == 'b') ? 'w' : 'b';
      //再度置けるマスがあるかチェック、パスが二回続いた場合ゲーム終了
      if (!this.checkAllCells()) {
        this.showGameResult();
      } else {
        this.showWhichTurn();
      }
    }
    //ゲーム終了のジャッジ
    if (this.numOfWhite == 0 || this.numOfBlack == 0 ||
      this.numOfWhite + this.numOfBlack == 64) {
        this.showGameResult();
    }
  },

  //今どっちの番か表示
  showWhichTurn : function () {
    var color = (this.nextColor == 'w') ? '白' : '黒';
    document.getElementById('whichTurn').textContent = color + 'の番です';
  },

  //白黒それぞれのディスクを数えて表示
  showDiscNums : function () {
    document.getElementById('numOfWhite').textContent = '白 : ' + this.numOfWhite;
    document.getElementById('numOfBlack').textContent = '黒 : ' + this.numOfBlack;
  },

  //ゲーム終了時の表示
  showGameResult : function() {
    var gameInfo = document.getElementById('whichTurn');
    if (this.numOfWhite > this.numOfBlack) {
      gameInfo.textContent = '白の勝ちです！';
    } else if (this.numOfWhite < this.numOfBlack){
      gameInfo.textContent = '黒の勝ちです！';
    } else {
      gameInfo.textContent = '引き分けです';
    }
  },

  //this.boardの座標通りに一枚のディスクを表示する
  showDisc : function(y, x) {
    if (this.board[y][x]) {
      var disc = document.createElement('div');
      disc.setAttribute('id', 'disc-' + y + '-' + x);
      disc.setAttribute('class', this.board[y][x] === 'w' ? 'whiteDisc' : 'blackDisc');

      var cell = document.getElementById('cell-' + y + '-' + x);
      cell.appendChild(disc);
    }
  },

  //初期状態を表示する
  show : function() {
    for (var i = 1; i <= 8; i++) {
      for (var j = 1; j <= 8; j++) {
        this.showDisc(i,j);
      }
    }
    this.showDiscNums();
    this.showWhichTurn();
  }

};

var othelloGame = new OthelloGame();
window.onload = function() {
  // オセロ盤を表示
  var othelloBoard = document.getElementById('othelloBoard');
  for(var i = 1; i <= 8; i++) {
    var row = document.createElement('tr');
    for(var j = 1; j <= 8; j++) {
      var cell = document.createElement('td');
      cell.setAttribute('id', 'cell-' + i + '-' + j);
      cell.setAttribute('onclick', 'othelloGame.putDisc(this); othelloGame.judge()');
      row.appendChild(cell);
    }
    othelloBoard.appendChild(row);
  }
  othelloGame.show();
  othelloGame.checkAllCells(); //初めに置けるマスを表示

  //コンピューターの強さ、色を選ばせる機能を追加
};
