import { GAME } from "../game.js";
import { FLIES_CONF, GET_FLIES_SPRITE } from "../facade/file.js";
import {
  checkBlockCollide,
  checkCollide,
  isInTheLeft,
} from "../facade/helper.js";
import { Setting } from "../setting.js";

export class Character {
  static GenerateFlies() {
    const game = GAME.getInstance();
    const totalFlies = Setting.GENERATED_FLIES;
    const w = Setting.FLIES_WIDTH;
    const h = Setting.FLIES_HEIG333;
    for (let i = 0; i < totalFlies; i++) {
      const x = Math.random() * game.width;
      const y = Math.random() * game.height - 350;
      game.flies.push(
        new this(x, y, w, h, GET_FLIES_SPRITE(), FLIES_CONF, false)
      );
    }
  }

  constructor(
    x,
    y,
    w,
    h,
    sprite,
    config,
    gravity = true,
    oneTimeRender = false
  ) {
    this.oneTimeRender = oneTimeRender;
    this.canCollide = true;
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetW = 0;
    this.offsetH = 0;
    this.savedNode = null;
    this.gravity = gravity;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sprite = sprite;
    this.spriteIdx = 0;
    this.speedX = Setting.CHARACTER_SPEED;
    this.speedY = 1;
    this.vx = 0;
    this.vy = 0;
    this.invert = 0;
    this.maxSpeed = Setting.CHARACTER_MAX_SPEED;
    this.config = config;
    this.game = GAME.getInstance();
    this.jumpForce = Setting.CHARACTER_JUMP_FORCE;
    this.spriteInterval = 0;
    this.backward = false;
    this.state = "";
    this.invicible = false;
    this.invicibleTime = 1;
    this.tempInvicible = false;
    this.health = 5;
    this.dead = false;
    this.callbacks = [];
    this.jumping = false;
    this.postJump = false;
  }

  checkInvicible() {
    // Check if is invicible set 100 / 60 second to set to uninvicible
    if (this.invicible && !this.tempInvicible) {
      this.tempInvicible = true;
      setTimeout(() => {
        this.tempInvicible = false;
        this.invicible = false;
      }, this.invicibleTime * 1000);
    }
  }

  middleXPos() {
    return this.x + this.w / 2;
  }
  middleYPos() {
    return this.y + this.h / 2;
  }

  // this method will called in rendered (for child class)
  parentMethod() {}

  isGrounded() {
    let collideFlag = false;
    this.game.objects.forEach((obj) => {
      if (obj.isCollideBlock(this.x, this.y, this.w, this.h + 1)) {
        collideFlag = true;
      }
    });
    this.game.grounds.forEach((obj) => {
      if (obj.isCollideBlock(this.x, this.y, this.w, this.h + 1)) {
        collideFlag = true;
      }
    });
    return collideFlag;
  }

  inFrontNode(offsetX) {
    const y = this.middleYPos();
    let x = 0;
    if (this.backward) {
      x = this.middleXPos() - offsetX;
    } else {
      x = this.middleXPos() + offsetX;
    }
    return { x, y };
  }

  isCollide(x, y) {
    if (!this.canCollide) return false;
    return checkCollide(this.x, this.y, this.w, this.h, x, y);
  }

  isCollideBlock(x, y, w, h) {
    const tempx = this.x + this.offsetX;
    const tempy = this.y + this.offsetY;
    const tempw = this.w + this.offsetW;
    const temph = this.h + this.offsetH;

    if (!this.canCollide) return false;
    return checkBlockCollide(tempx, tempy, tempw, temph, x, y, w, h);
  }

  checkBound() {
    // 50 -> Player Offset X
    if (
      (!this.backward && this.x + this.w + 1 > this.game.width) ||
      (this.backward && this.x - 1 < 0)
    ) {
      // this.backward = true;
      // this.vx = 0;
      return true;
    }
    return false;
  }

  logic() {
    // Incrementing the sprite
    this.spriteInterval += 60 * this.game.delta;
    // console.log("sprite interval :", this.spriteInterval);
    if (this.spriteInterval > this.config.speed) {
      this.spriteIdx += 1;
      this.spriteInterval = 0;
    }

    if (this.oneTimeRender && this.spriteIdx >= this.config.max - 1) {
      this.spriteIdx = this.config.max - 1;
    }

    // If death then sprite index will no go back
    if (this.dead) {
      if (this.spriteIdx >= this.config.max) {
        this.spriteIdx = this.config.max - 1;
      }
    }

    // Call parent method
    this.parentMethod();

    // console.log("vx : ", this.vx);
    // If not grounded then gravity will turn down the player

    if (!this.checkBound() && !this.isCollideObject()) {
      // console.log("speed : ", this.vx * this.game.delta);
      this.x += this.vx * this.game.delta;
      this.diedStop();
    }

    this.y += this.vy * this.game.delta;

    if (this.canCollide) {
      if (this.isGrounded() || this.isHitUpperWall()) {
        this.vy = 0;
      } else {
        if (this.gravity) {
          this.vy += this.game.gravity * this.game.delta;
        }
      }
    }

    // Check velocity at max speed
    this.checkMaxSpeed();
    this.checkBound();

    this.checkInvicible();

    this.callbacks.forEach((cb) => {
      cb();
    });
  }

  saveScale() {
    this.savedNode = {
      w: this.w,
      h: this.h,
    };
  }

  restoreScale() {
    if (this.savedNode) {
      this.w = this.savedNode.w;
      this.h = this.savedNode.h;
      this.savedNode = null;
    } else {
      console.log("there's nothing to restore!");
    }
  }

  save() {
    this.savedNode = {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  restore() {
    if (this.savedNode) {
      this.x = this.savedNode.x;
      this.y = this.savedNode.y;
      this.w = this.savedNode.w;
      this.h = this.savedNode.h;
      this.savedNode = null;
    } else {
      console.log("there's nothing to restore!");
    }
  }

  isHitUpperWall() {
    return this.game.isCollideObjectBlock(
      this.x + 5 + this.w / 2,
      this.y + 50 + this.vy * this.game.delta,
      5,
      1
    );
  }

  canJump() {
    return (
      this.isGrounded() &&
      !this.game.isCollideObject(
        this.x + this.w / 2,
        this.y + this.vy * this.game.delta
      )
    );
  }

  lookAtPlayer() {
    const game = GAME.getInstance();
    if (isInTheLeft(game.player, this)) {
      console.log("backward");
      this.backward = true;
    } else {
      console.log("forward");
      this.backward = false;
    }
  }
  /* Moving the canvas by dx and dy. */

  lookAt(obj) {
    if (isInTheLeft(obj, this)) {
      console.log("backward");
      this.backward = true;
    } else {
      console.log("forward");
      this.backward = false;
    }
  }

  isDead() {
    return this.dead;
  }

  checkMaxSpeed() {
    if (this.vx > this.maxSpeed) {
      this.vx = this.maxSpeed;
    } else if (this.vx < -this.maxSpeed) {
      this.vx = -this.maxSpeed;
    }
    // if (this.vy < -this.maxSpeed) {
    //   this.vy = -this.maxSpeed;
    // }
  }

  diedStop() {
    if (this.dead && this.vx > 0) {
      this.vx -= 1;
    } else if (this.dead && this.vx < 0) {
      this.vx += 1;
    }
  }

  checkInvert() {
    if (this.invert !== null && this.invert > 0) {
      this.game.ctx.filter = `invert(${this.invert})`;
    }
  }

  isCollideObject() {
    if (this.canCollide) {
      let flag = false;
      this.game.objects.forEach((obj) => {
        const inc = !this.backward
          ? this.vx * this.game.delta
          : this.vx * this.game.delta;

        if (obj.isCollide(this.x + inc, this.y + this.h / 2)) {
          flag = true;
        }
      });
      return flag;
    } else {
      return false;
    }
  }

  renderBackward(idx) {
    this.game.ctx.save();
    this.game.ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    this.game.ctx.scale(-1, 1);
    this.checkInvert();
    this.game.ctx.drawImage(
      this.sprite[idx],
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );
    this.game.ctx.restore();
  }

  renderForward(idx) {
    this.game.ctx.save();
    this.checkInvert();
    this.game.ctx.scale(1, 1);
    this.game.ctx.drawImage(this.sprite[idx], this.x, this.y, this.w, this.h);
    this.game.ctx.restore();
  }

  render() {
    this.logic();

    const idx = this.spriteIdx % this.config.max;

    // !Debugging Purpose
    // console.log("rendering : ", idx, " max : ", this.config.max);

    if (this.invert) {
    }

    if (this.backward) {
      this.renderBackward(idx);
    } else {
      this.renderForward(idx);
    }
  }
}
