function GetPlayer(obj1, obj2)
{
	var ret = { player : null, other : null};

	if(obj1.isDead || obj2.isDead)
		return false;

	if(obj1.type == 'player')
	{
		ret.player = obj1;
		ret.other = obj2;
		return ret;
	} 

	if(obj2.type == 'player')
	{
		ret.player = obj2;
		ret.other = obj1;
		return ret;
	}

	return false;
}

function AddGold(x, y) {
	var obj = g_objList.Add(x, y - TILE_HEIGHT, 'coin');	
	if(randomRange(0, 1) == 0)
		obj.ax = -1;
	else
		obj.ax = 1;

	obj.ax = obj.ax * randomRange(10, 20) / 10;
	obj.ay = -10;
	obj.default_ay = 0.3;
	obj.max_ay = 5;
	obj.hp = 0;
	obj.max_ay = 10;
}

function AddTurret(x, y) {
	var obj = g_objList.Add(x, y, 'turret');	
	obj.ax = 0;
	obj.ay = 0;
	obj.default_ay = 0;
	obj.default_ax = 0;
	obj.hp = 1; 
	obj.max_ay = 0;
	obj.SetState('normal');

	var effect = g_effectManager.Add( obj.x + obj.width / 2 + 5 - randomRange(0, 10),
						obj.y + obj.height / 2 + 5 - randomRange(0, 10),
						'#000', '', g_imgs['dust'], obj.width * 2, obj.height * 2);
	effect.world = true; 
}

var Obj = function() {
	this.x = 0;
	this.y = 0;
	this.ax = 0;
	this.ay = 0;
	this.default_ay = 0;
	this.hp = 1;
	this.maxHP = 1;
	this.max_ay = 10;
	this.max_ax = 0;
	this.level = 1;

	this.weakPoint = 0;
	this.weakPointChangeLastTime = 0;

	this.width = TILE_WIDTH;
	this.height = TILE_HEIGHT;

	this.col_x = 0;
	this.col_y = 0;
	this.col_width = TILE_WIDTH;
	this.col_height = TILE_HEIGHT;

	this.scaleDefalt = 1.0;
	this.renderX = this.x;
	this.renderY = this.y;
	this.scale = 1.0;
	this.type = 0;
	this.level = 0;
	this.state = 'unknown';
	this.stateChangeDate = new Date();

	this.isPlayer = false;
	this.isDead = false;
	this.visible = false;

	this.firstFrame = true;

	this.attackLastTime = 0;
	this.enemy = false;

	this.SetState = function(state) {
		this.state = state;
		this.stateChangeDate = new Date(); 
	}

	this.DustEffect = function() {
		effect = g_effectManager.Add( this.x + this.width / 2 + 5 - randomRange(0, 10),
							this.y + this.height / 2 + 5 - randomRange(0, 10),
							'#000', '', g_imgs['dust'], this.width * 2, this.height * 2);
		effect.world = true; 
	}

	this.Damaged = function(dmg) {
	//	if(this.type == "player")
	//		return;

		if(this.isDead)
			return;

		this.SetState('damaged');
		this.hp -= dmg;
		var effect = g_effectManager.Add(this.x + this.width / 2 + 5 - randomRange(0, 10), 
											this.y, "#ff0000", "-"+dmg);
		effect.world = true;
		if(this.hp <= 0) 
		{
			this.isDead = true; 
			this.DustEffect();
			if(this.type != "coin" && this.type != "turret" && this.type != "meteo" && this.type != "merchant") 
			{ 
				g_score++;
//				AddGold(this.x, this.y); 
			}
		}
	}

	this.Update = function()
	{ 
		if(this.visibleDelay < totalFPS) 
			this.visible = true;
		else
			return;

		if(this.firstFrame) {
			this.firstFrame = false;
			this.SetState('normal');
			this.attackLastTime = g_now; 

			this.tx = this.x;
			this.ty = this.y; 

			var tokens = this.type.split("mon_");
			this.level = parseInt(tokens[1]);
		}
		
		if(this.isDead)
			return;

		if(!this.visible)
			return; 

		this.scale -= 0.05;
		if(this.scale < 1.0)
			this.scale = 1.0;

		var prevX = this.x;
		var prevY = this.y;

		var dx = this.x - this.tx;
		var dy = this.y - this.ty;

		if(dx != 0) {
			dx = dx / Math.abs(dx);
			this.x -= dx * 2;
		}

		if(dy != 0) {
			dy = dy / Math.abs(dy);
			this.y -= dy * 2;
		}

		if(Math.abs(dx) < 2)
			this.x = this.tx;

		if(Math.abs(dy) < 2)
			this.y = this.ty;

		this.renderX = this.x - g_cameraX;
		this.renderY = this.y - g_cameraY;
		switch(this.state) {
			case 'normal':
				var list = g_objList.GetChrByPos(this.x, this.y);
				for(var i in list)
				{
					var obj = list[i];
					if(obj.type =='straw' && this.type.indexOf("mon_") == 0)
						this.Damaged(999);
				}
				break;

			case 'damaged':
				if(g_now.getTime() - this.stateChangeDate.getTime() > 100)
					this.SetState('normal');
				else {
					this.renderX += randomRange(0, 10) - 5; 
					this.renderY += randomRange(0, 10) - 5; 
				}
				break; 
		} 
	}

	this.Render = function()
	{ 
		if(this.isDead)
			return;

		if(!this.visible)
			return;

		Renderer.SetAlpha(1);
	
		var x = this.renderX;
		var y = this.renderY;
		var img = g_imgs[this.type];


		var draw = true;

		if(this.type == "coin" && this.state == "idle") {
			var timeLeft = g_now - this.stateChangeDate;
			var mid = 1000 - timeLeft / 5000 * 1000;
			if(timeLeft % mid < mid / 2)
				draw = false; 
		}

		if(img) {
			if(draw)  {
				if(this.enemy) {
					Renderer.SetAlpha(0.5);
					Renderer.SetColor('#f00');
					Renderer.Rect(x, y, this.width, this.height); 
					Renderer.SetAlpha(1);
				}

				Renderer.ImgBlt(x - (this.width * this.scale - this.width ) / 2, 
							y - (this.height * this.scale - this.height) / 2, 
						img.img, 
						0, 0, img.width, img.height,	
						this.width * this.scale, this.height * this.scale); 
			}
		}
		else {
			Renderer.SetColor('#000');
			Renderer.Rect(x, y, this.width, this.height); 
		}

		Renderer.SetColor('#0f0');
		Renderer.Text(x + this.width / 2, y + this.height - 20, this.level); 

		if(this.type == "cragon") {
			Renderer.SetAlpha(0.2);
			Renderer.SetColor('#f00');
			var width = this.width / 3;
			Renderer.Rect(this.weakPoint * width, this.renderY, width, this.height); 
		}
	}

};

var ObjManager = function()
{ 
	this.ax = 0;
	this.ay = 0;
	this.m_list = [];

	this.Clear = function()
	{
		this.m_list = [];
	}

	this.Generate = function(x, y, type)
	{
		var obj = new Obj();
		
		obj.x = x;
		obj.y = y;
		obj.type = type; 

		if(type == 'player' || type =='gold' || type=='box')
			obj.level = 1; 

		switch(type)
		{
			case 'mon':
				obj.turnLife = 8;
//				obj.level = Math.min(Math.round(g_turn / 20), 5) + 1;
				obj.level = g_genMonLevel;
				obj.CalcMonStat();
				break;

			case 'merchant':
				obj.hp = 4;
				break;

			case 'npc':
				obj.hp = 2;
				break;

			default:
				obj.turnLife = -1; 
				break; 
		}

		obj.visibleDelay = 0;

		return obj;
	}

	this.Add = function(x, y, type)
	{
		var obj = this.Generate(x, y, type);
		this.m_list.push(obj); 

		return obj;
	}

	this.Update = function()
	{
		var prevCnt = this.moveCnt;
		this.moveCnt = 0;

		var deadList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Update();
			if(item.isDead)
				deadList.push(item);
		}

		for(var i in deadList)
			removeFromList(this.m_list, deadList[i]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				console.log('dead alive');
		} 

		if(prevCnt > 0 && this.moveCnt == 0)
		{ 
			this.ax = 0;
			this.ay = 0;

			for(var i in this.m_list)
			{
				var item = this.m_list[i];
				item.forceStop = false;
			} 
		} 
	}

	this.Render = function()
	{
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			item.Render();
		} 
	}

	this.CheckCollision = function(x, y, obj)
	{ 
		var list = [];

		if(obj && obj.isDead)
			return list;

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item == obj)
				continue; 

			if(item.isDead)
				continue;

			if(item.state == 'unknown')
				continue;
			
			if(!(x >= item.x + item.col_x + item.col_width || 
				x + obj.col_x + obj.col_width <= item.x || 
				y >= item.y + item.col_y + item.col_height ||
				y + obj.col_y + obj.col_height <= item.y))
				list.push(item); 
		}
		return list; 
	}

	this.GetChrByPos = function(x,y)
	{ 
		var list = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if((item.x == x) && (item.y == y))
				list.push(item);
		}

		return list;
	}

	this.GetObjByType = function(type)
	{
		var list = []
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type == type)
				list.push(item);
		} 
		return list;
	}

	this.ClearObjectType = function(type)
	{
		var deadList = [];
		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.type != type)
				continue;
				
			item.isDead = true;
			deadList.push(item);
		} 

		for(var i in deadList)
			removeFromList(this.m_list, deadList[i]);

		for(var i in this.m_list)
		{
			var item = this.m_list[i];
			if(item.isDead)
				console.log('dead alive');
		} 
	}

	this.GetMoveObj = function() {
		var list = [];
		for(var i in this.m_list) {
			var item = this.m_list[i];

			if(item.x != item.tx ||
				item.y != item.ty) {
				list.push(item);
			} 
		}

		return list;
	}
}; 
