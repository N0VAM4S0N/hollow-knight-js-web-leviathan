import { GAME } from "../data.js";
import {
  GET_PLAYER_ATTACK_SPLASH_SPRITE,
  GET_PLAYER_ATTACK_SPRITE,
  GET_PLAYER_IDLE_SPRITE,
  GET_PLAYER_JUMP_SPRITE,
  GET_PLAYER_WALK_SPRITE,
  PLAYER_CONF,
} from "../facade/file.js";
import { Character } from "../parent/character.js";
import { Setting } from "../setting.js";
import { Particle } from "./particle.js";

export class Player extends Character {
  move() {}

  // Method for rendering player right circle
  renderLight() {
    const lightRadius = 200;
    const game = GAME.getInstance();
    game.ctx.beginPath();
    // game.ctx.globalAlpha = 0.1;
    game.ctx.fillStyle = "white";
    const midX = this.middleXPos();
    const midY = this.middleYPos();
    var radgrad = game.ctx.createRadialGradient(
      midX,
      midY,
      0,
      midX,
      midY,
      lightRadius
    );
    radgrad.addColorStop(0, "rgba(255,255,255,0.45)");
    radgrad.addColorStop(0.2, "rgba(255,255,255,0.25)");
    radgrad.addColorStop(0.5, "rgba(255,255,255,0.15)");
    radgrad.addColorStop(1, "rgba(160,230,255,0)");

    game.ctx.fillStyle = radgrad;
    game.ctx.fillRect(0, 0, game.width, game.height);
    game.ctx.globalAlpha = 1;
  }

  importantState(state) {
    const states = ["jump", "attack"];
    return states.includes(state);
  }

  changeSprite(state) {
    if (
      this.state == "attack" ||
      (this.state == "jump" && state != "attack" && state != "jump")
    )
      return;
    switch (state) {
      case "idle":
        this.config = PLAYER_CONF.idle;
        this.sprite = GET_PLAYER_IDLE_SPRITE();
        break;
      case "walk":
        this.config = PLAYER_CONF.walk;
        this.sprite = GET_PLAYER_WALK_SPRITE();
        break;
      case "attack":
        this.state = "attack";
        this.spriteIdx = 0;
        this.config = PLAYER_CONF.attack;
        this.sprite = GET_PLAYER_ATTACK_SPRITE();
        break;
      case "jump":
        this.state = "jump";
        this.spriteIdx = 0;
        this.config = PLAYER_CONF.jump;
        this.sprite = GET_PLAYER_JUMP_SPRITE();
        break;
    }
  }

  attack() {
    // Get Node (x, y) in front of player position
    const node = this.inFrontNode(-10);

    const idx = this.splashIndex % PLAYER_CONF.splash.max;
    this.splashIndex += 1;

    this.changeSprite("attack");
    console.log(this.backward);

    // Emit The Whiet Particle Effect
    Particle.emit(
      this.backward ? node.x - this.splashWidth : node.x,
      node.y - this.splashHeight / 2,
      this.splashWidth,
      this.splashHeight,
      GET_PLAYER_ATTACK_SPLASH_SPRITE(idx),
      PLAYER_CONF.splash,
      this.backward
    );
  }

  checkMovement() {
    if (this.game.keys[Setting.PLAYER_MOVEMENT_RIGHT]) {
      this.changeSprite("walk");
      this.backward = false;
      this.vx += this.speedX;
    } else if (this.game.keys[Setting.PLAYER_MOVEMENT_LEFT]) {
      this.changeSprite("walk");
      this.vx -= this.speedX;
      this.backward = true;
    } else {
      this.changeSprite("idle");
      this.vx = 0;
    }
  }

  // Always be called when super class render (object)

  checkState() {
    // Check if attacking state
    if (this.spriteIdx == this.config.max - 1) {
      this.state = "";
    }
  }

  parentMethod() {
    this.checkState();
    this.checkMovement();
    this.renderLight();
  }

  jump() {
    if (this.isGrounded()) {
      this.vy -= this.jumpForce;
      this.changeSprite("jump");
    }
  }

  initPlayer() {
    this.splashWidth = 250;
    this.splashHeight = 250;
    this.attackSprite = GET_PLAYER_ATTACK_SPLASH_SPRITE();
    this.splashIndex = 0;
  }

  constructor(x, y, w, h, sprite, maxSprite) {
    super(x, y, w, h, sprite, maxSprite);
    this.initPlayer();
  }
}
