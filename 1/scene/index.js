var TILE_WIDTH = 53;
var TILE_HEIGHT = 53;
var MAX_LEVEL = 3;

var g_cameraX = 0;
var g_cameraY = 0;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();

var g_objList = new ObjManager(); 
var g_imgs = [];

var g_turnStart = false;

var g_holdObject = null;

var SceneIngame = function() { 

	this.LoadStage = function(idx) {
		this.state = 'game';
	
		g_objList.Clear();
		console.log('start!');
		Renderer.defaultColor = "#000"; 
	}

	this.LoadImg = function(name, img, width, height) {
		g_imgs[name] = {};
		g_imgs[name].img = ImageManager.Register( "assets/"+img, name);
		g_imgs[name].width = width;
		g_imgs[name].height = height;

		return g_imgs[name];
	}

	this.Start = function() { 
		this.LoadImg('bg', 'bg.png',  320, 500); 
		this.LoadImg('player', 'player.png',  128, 128); 

		this.LoadImg('mon_1', '01001.png', 128, 128);
		this.LoadImg('mon_2', '01003.png', 128, 128);
		this.LoadImg('mon_3', '01005.png', 128, 128);
		this.LoadImg('mon_4', '01006.png', 128, 128);
		this.LoadImg('mon_5', '01007.png', 128, 128);

		this.LoadImg('sword_effect', 'sword_effect.png', 60, 60);

		this.LoadImg('hp', 'heart.gif', 50, 50);

		this.LoadImg('coin', 'gold.png', 64, 64);


		this.LoadImg('dust', 'dust.png', 208, 208);
		this.LoadImg('meteo', 'meteo.png', 128, 128);
		this.LoadImg('warn', 'ability_08.png', 128, 128); 
		this.LoadImg('redline', 'redline.png', 1, 500); 

		this.LoadImg('merchant', 'merchant.png', 128, 128);
		this.LoadImg('turret', 'turret.png', 60, 60);
		this.LoadImg('turret_fire', 'turret_fire.png', 320, 6);

		this.LoadImg('item_turret', 'item_turret.png', 60, 60);

		this.LoadImg('straw', 'straw.png', 64, 64);


		mon = g_objList.Add(TILE_WIDTH * 3 , TILE_HEIGHT * 3, "straw"); 
		mon = g_objList.Add(TILE_WIDTH * 3 , TILE_HEIGHT * 4, "player"); 

		for(var i = 0; i < 10; ++i)
			this.GenerateUnit();
	}

	this.End = function() {
	} 

	this.UpdateGames = function() {
		if(this.state == 'gameOver')
			return;

		g_objList.Update(); 
	}

	this.GenerateUnit= function() {
		var col = parseInt(Renderer.width / TILE_WIDTH);
		var row = parseInt(Renderer.height / TILE_HEIGHT);

		var x = randomRange(0, col - 1) * TILE_WIDTH;
		var y = randomRange(0, row - 1) * TILE_HEIGHT;
		var list = g_objList.GetChrByPos(x, y);
		if(list.length == 0)
			mon = g_objList.Add(x, y, "mon_1"); 
	}
	
	this.Update = function()
	{ 
		this.UpdateGames();

//		g_stageTimeLeft = g_stageTimeMax - (g_now - g_stageTime) / 1000;
//		if(this.state != 'gameOver') {
//			this.state = "gameOver";
//			var user = prompt("이름을 입력 해 주세요", "AAA");
//
//			var scene = this;
//			if(user != null) {
//				ajaxReq("r.php", { height : g_height, score : g_score, gold : g_coin, player : user }, function() {
//					scene.getScores();
//				});
//			}
//			else
//				scene.getScores();
//		}
//


		if(MouseManager.Clicked) 
		{
			var x = parseInt(MouseManager.x / TILE_WIDTH) * TILE_WIDTH;
			var y = parseInt(MouseManager.y / TILE_HEIGHT) * TILE_HEIGHT;
			var list = g_objList.GetChrByPos( x, y);
			console.log(list);
			for(var i in list) 
			{
				var item = list[i];
				if(item.type == 'player')
					g_holdObject = item;
			}
		}

		if(!MouseManager.LDown && g_holdObject)
		{
			g_holdObject.x = parseInt((g_holdObject.x + TILE_WIDTH / 2) / TILE_WIDTH) * TILE_WIDTH;
			g_holdObject.y = parseInt((g_holdObject.y + TILE_HEIGHT/ 2) / TILE_HEIGHT) * TILE_HEIGHT;
			g_holdObject.tx = g_holdObject.x;
			g_holdObject.ty = g_holdObject.y; 
			console.log(g_holdObject.x, g_holdObject.y);
			g_holdObject = null; 
		}

		if(g_holdObject) 
		{
			var prex = parseInt((g_holdObject.x + TILE_WIDTH / 2) / TILE_WIDTH) * TILE_WIDTH;
			var prey = parseInt((g_holdObject.y + TILE_HEIGHT/ 2) / TILE_HEIGHT) * TILE_HEIGHT;

			g_holdObject.x = MouseManager.x - TILE_WIDTH / 2;
			g_holdObject.y = MouseManager.y - TILE_HEIGHT / 2;
			g_holdObject.tx = g_holdObject.x;
			g_holdObject.ty = g_holdObject.y; 

			var objx = parseInt((g_holdObject.x + TILE_WIDTH / 2) / TILE_WIDTH) * TILE_WIDTH;
			var objy = parseInt((g_holdObject.y + TILE_HEIGHT/ 2) / TILE_HEIGHT) * TILE_HEIGHT;

			var list = g_objList.GetChrByPos( objx, objy);
			for(var i in list) 
			{
				var item = list[i];
				if(item.type == 'player')
					continue;

				if(item.type == 'straw')
					continue;

				item.tx = prex;
				item.ty = prey;
			}
		}

		g_gameUI.Update();
		g_effectManager.Update(); 
	}

	this.getScores = function() {
		ajaxReq("get_scores.php", function(list) {
			g_score_list = list; 
			console.log(list);
		}); 
	}

	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#000");
		Renderer.Rect(0,0,Renderer.width, Renderer.height);
		
		var bg = g_imgs['bg'];
		Renderer.Img(0,bg.height - g_cameraY, bg.img);

		g_objList.Render(); 
		g_effectManager.Render(); 

		Renderer.SetAlpha(1.0); 
		Renderer.SetFont('8pt Arial'); 
		Renderer.SetColor("#555");

		for(var i = 0; i < Renderer.width ; i += TILE_WIDTH) 
			Renderer.Rect(i, 0, 1, Renderer.height);

		for(var j = 0; j < Renderer.height ; j += TILE_HEIGHT) 
			Renderer.Rect(0, j, Renderer.width, 1);


		if(this.state == "gameOver") {
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000");
			Renderer.Rect(0,0,Renderer.width, Renderer.height);
			Renderer.SetFont('15pt Arial'); 
			Renderer.SetColor("#fff");
			Renderer.Text(130,20,"게임 오버!");
			Renderer.Text(40,50,"플레이 해주셔서 감사합니다!");
			Renderer.Text(20,100  , "순위");
			Renderer.Text(80,100  , "점수");
			Renderer.Text(140,100 , "높이");
			Renderer.Text(200,100 , "이름");
			for(var i in g_score_list) {
				var item = g_score_list[i];
				var curLine = 100 + (parseInt(i)+1) * 30;
				Renderer.Text(20, curLine, parseInt(i)+1);
				Renderer.Text(80, curLine, item.score);
				Renderer.Text(140, curLine, item.height);
				Renderer.Text(200, curLine, item.player);
			}
		} else {
		} 
	} 
};
