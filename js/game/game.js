import { GET_BOSS_BG } from "./facade/file.js";
import { Boss } from "./model/boss.js";
import { BossDoor } from "./model/bossdoor.js";
import { UI } from "./model/ui.js";
import { Setting } from "./setting.js";

export class GAME {
  static gameInstance;

  static getInstance = () => {
    if (this.gameInstance == null) {
      this.gameInstance = new GAME();
    }
    return this.gameInstance;
  };

  constructor() {
    this.player;
    this.maxLeftX = 595;
    this.maxRightX = 1400;
    this.maxTop = 350;
    this.scale = Setting.SCALE;
    this.pause = false;
    this.objects = [];
    this.characters = [];
    this.keys = [];
    this.particles = [];
    this.camera = null;
    this.shake = false;
    this.backgrounds = [];
    this.foregrounds = [];
    this.mainBackground;
    this.boss = null;
    this.enemies = [];
    this.debugs = [];
    this.flies = [];
    this.gravity = Setting.GRAVITY;
    this.canvas = document.getElementById("myCanvas");
    this.ctx = document.getElementById("myCanvas").getContext("2d");
    this.width = Setting.WIDTH;
    this.height = Setting.HEIGHT;
    this.fps = Setting.FPS;
    this.delta = 0;
    this.bossFight = false;
    this.killedCrawlid = 0;
  }

  checkCrawlidKilled() {
    const ui = UI.getInstance();
    if (ui.money > Setting.TOTAL_CRAWLID) {
      const door = BossDoor.GetInstance();
      door.openDoor();
    }
  }

  debug(x, y, w, h, color = "red") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }
  addDebugs(x, y, w, h, color = "red") {
    this.debugs.push({ x: x, y: y, w: w, h: h, color: color });
  }
  renderDebugs() {
    this.debugs.forEach((obj) => {
      this.ctx.fillStyle = obj.color;
      this.ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    });
  }

  changeBossScene() {
    // Settup Background
    this.mainBackground.sprite = GET_BOSS_BG();

    // Clear Enemy
    this.bossFight = true;
    this.enemies.length = 0;

    // Teleport Player
    const offsetX = 30;
    this.player.x = offsetX + 0 + this.player.w;

    // Create Boss
    const boss = new Boss(
      Setting.BOSS_INITIAL_X,
      Setting.BOSS_INITIAL_Y,
      Setting.BOSS_WIDTH,
      Setting.BOSS_HEIGHT
    );
    this.enemies.push(boss);
    this.boss = boss;
  }

  shakeScene(t) {
    this.shake = true;
    setTimeout(() => {
      this.shake = false;
    }, t * 1000);
  }

  // debug(render, color = "blue") {
  //   this.ctx.fillStyle = color;
  //   this.ctx.fillRect(render.x, render.y, render.w, render.h);
  // }
}
