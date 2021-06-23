<template>
  <div class="game">
    <div class="countDown"  @click="start">
      <div>剩餘: {{ Math.ceil(timeData.time) }}秒</div>
      <div class="bar">
        <div class="barBg" :style="{width: `${ (timeData.time / timeData.gameLength) * 100 }%`}"></div>
      </div>
    </div>
    <canvas ref="canvas" class="gameCanvas" @click="clickCanvas"></canvas>
    <div class="parts">
      <div class="taunt" :style="taunt">{{ taunt.text }}</div>
    </div>
    <div class="mask" v-if="showMask">
        <div class="countDownNum" v-if="startCountDownTime">
          <img :src="imgs.count[startCountDownTime -1].src">
        </div>
        <div class="countDownText" v-else>
          <img :src="imgs.count[startCountDownTime -1].src">
        </div>
    </div>
    <!-- <div>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
    </div> -->
  </div>
</template>
<script>
export default {
  data () {
    return {
      showMask: false, // 显示倒计时遮罩
      startCountDownTime: 4, // 开始倒计时
      taunt: { // 嘲讽弹窗
        top: 0,
        left: 0,
        display: 'none',
        text: ''
      },
      names: ['垂耳兔', '團團熊', '咕咕雞', '雪球鼠', '可可熊', '橘皮貓'],
      imgs: {  // 图片
        fish: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        gun: ['bulletAfter', 'bullet1', 'bulletBefore'],
        bullet: ['bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5', 'bullet6'],
        bag: ['bag'],
        count: ['start', 'cd1', 'cd2', 'cd3'],
        hit: ['hit']
      },
      canvas: { // 画布
        el: null,
        ctx: null,
        width: this.toCurPX(750),
        height: this.toCurPX(800),
        runing: false
      },
      fishData: { // 保存鱼数据
        has: 0,
        height: [
          this.toCurPX(204), 
          this.toCurPX(159),
          this.toCurPX(82),
          this.toCurPX(88),
          this.toCurPX(88)
        ],
        matrix: [
          [{id: 4, type: 0},{id: 4, type: 1},{id: 4, type: 2}],
          [{id: 3, type: 3},{id: 3, type: 4},{id: 3, type: 5},{id: 3, type: 4},{id: 3, type: 3}],
          [{id: 2, type: 6},{id: 2, type: 7},{id: 2, type: 8},{id: 2, type: 6},{id: 2, type: 7},{id: 2, type: 8}],
          [{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9}],
          [{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10}],
        ],
        list: [],
        targFishDead: false
      },
      bulletData: { // 保存子弹数据
        width: this.toCurPX(128 / 3),
        height: this.toCurPX(118 / 3),
        color: '#000',
        num: 10000,
        use: 0,
        curBullet: null,
        list: []
      },
      timeData: { // 倒计时
        timestamp: 0, // 保存时间戳
        runTime: 0, // 运行时间
        time: 20, // 倒计时
        gameLength: 20 // 游戏时长
      },
      gunData: { // 炮弹数据
        color: "#fac",
        height: this.toCurPX(164),
        width: this.toCurPX(188),
        name: '',
        type: 0,
        centerX: 0, // 原坐标x
        centerY: 0, // 原坐标y
        targFishList: [], // 目标线上的鱼
        runing: false // 飞行中
      },
      bagData: { // 背包数据
        img: null,
        num: 0
      }
    }
  },
  async mounted () {
    await this.loadImgs();
    this.$nextTick(() => {
      this.canvas.height = this.$refs.canvas.offsetHeight * window.devicePixelRatio;
      console.log(this.canvas.height);
      this.init();
      this.startCountDown();
      // this.start();
    })
  },
  methods: {
    // 加载图片
    loadImgs () {
      return new Promise((res, rej) => {
        let count = 0;
        let total = 0;
        let errorImg = [];
        for (let key in this.imgs) {
          total += this.imgs[key].length;
          this.imgs[key].forEach((imgStr, index) => {
            let img = new Image();
            img.src = require(`../assets/image/${imgStr}.png`);
            // img.src = require(`../assets/image/${imgStr}`);
            img.onload = () => {
              count++;
              this.imgs[key][index] = img;
              console.log('加载', `${Math.ceil((count / total) * 100)}%`)
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
            img.onerror = () => {
              total --;
              errorImg.push(imgStr)
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
          })
        }
      })
    },
    toCurPX (px) { // 轉換為當前屏幕大小的像素
      return px / (750 / 100) * (window.innerWidth / 100) * window.devicePixelRatio;
    },
    // 开始倒计时
    startCountDown () {
      this.showMask = true;
      this.startCountDownTime = 4;
      let tiemr = setInterval(() => {
        this.startCountDownTime--
        if (this.startCountDownTime <= 0) {
          clearInterval(tiemr);
          this.showMask = false;
          this.init();
          this.start();
        }
      }, 1000)
    },
    init () { // 初始化
      if (!this.canvas.el) {
        this.canvas.el = this.$refs.canvas;
        this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.width = this.canvas.width;
        this.canvas.el.height = this.canvas.height;
      }
      this.bulletData.list = [];
      this.initFish();
      this.initGun();
      this.initBag();
      this.draw();
    },
    // 初始化鱼数据
    initFish () {
      this.fishData.list = [];
      let y = 0;
      // 初始化矩阵数据
      this.fishData.matrix.forEach((fishRow, index) => {
        let fishHeight = this.fishData.height[index];
        fishRow.forEach((fish, i) => {
          fish.row = index;
          fish.cel = i;
          // 宽高
          fish.height = fishHeight;
          fish.width = this.canvas.width / fishRow.length;
          // 左上角,右下角坐标
          fish.x = i * fish.width;
          fish.y = y;
          fish.x1 = (i + 1) * fish.width;
          fish.y1 = y + fish.height;
          fish.coordinate = [fish.x, fish.y, fish.x1, fish.y1];
          // 中心点
          fish.centerX = fish.x + fish.width / 2;
          fish.centerY = fish.y + fish.height / 2;
          // 死亡
          fish.isDead = false;
          // 内容
          let itemImg = this.imgs.fish[fish.type];
          // let itemHeight = 0.5 * fish.height;
          // let itemWidth = itemHeight / itemImg.height * itemImg.width;
          let itemWidth = this.toCurPX(0.9 * itemImg.width);
          let itemHeight = itemWidth / itemImg.width * itemImg.height;
          let itemX = fish.centerX - itemWidth / 2;
          let itemY = fish.centerY - itemHeight / 2;
          let itemX1 = itemX + itemWidth;
          let itemY1 = itemY + itemHeight;
          fish.item = {
            img: itemImg,
            height: itemHeight,
            width: itemWidth,
            x: itemX,
            y: itemY,
            x1: itemX1,
            y1: itemY1,
            stepX: this.toCurPX(Math.random() * 0.1),
            stepY: this.toCurPX(Math.random() * 0.1),
            isPlay: false,
            play: () => { // 鱼游动
              let item = fish.item;
              if (item.isPlay) return;
              item.isPlay = true;
              clearInterval(fish.item.timer);
              fish.item.timer = this.fps60Timer(() => {
                if (item.y1 + item.stepY > fish.y1 || item.y + item.stepY < fish.y) {
                  item.stepY = -item.stepY;
                }
                if (item.x1 + item.stepX > fish.x1 || item.x + item.stepX < fish.x) {
                  item.stepX = -item.stepX;
                }
                item.x+=item.stepX;
                item.x1+=item.stepX;
                item.y+=item.stepY;
                item.y1+=item.stepY;
                if (fish.isDead || !this.canvas.runing) {
                  clearInterval(fish.item.timer);
                }
              }, 120)
            },
            stop: () => {
              clearInterval(fish.item.timer);
            }
          }
          fish.hit = {
            img: this.imgs.hit[0],
            isShow: false,
            dead: () => {
              fish.item.stop();
              fish.hit.isShow = true;
              fish.hit.width = this.toCurPX(fish.hit.img.width);
              fish.hit.height = fish.hit.width / fish.hit.img.width * fish.hit.img.height;
              fish.hit.x = fish.item.x + fish.item.width / 2 - fish.hit.width / 2;
              fish.hit.y = fish.item.y + fish.item.height / 2 - fish.hit.height / 2;
              setTimeout(() => {
                fish.isDead = true; // 鱼死亡
                fish.hit.isShow = false;
                this.bulletData.curBullet = null;
                if (!this.gunData.text.getText()) {
                  this.stop();
                }
              }, 500);
            },
            noDead: () => {
              this.taunt.left = (fish.item.x / window.devicePixelRatio) + 'px';
              this.taunt.top = (fish.item.y / window.devicePixelRatio) + 'px';
              this.taunt.display = 'block';
              this.taunt.text = ['哈哈, 我比你強', '哈哈, 你沒瞄準我', '哈哈, 我避開了', '追上我, 我就給你嘿嘿嘿'][Math.floor(Math.random() * 4)]
              setTimeout(() => {
                // fish.isDead = true; // 鱼死亡
                this.bulletData.curBullet = null;
                this.taunt.display = 'none';
                if (!this.gunData.text.getText()) {
                  this.stop();
                }
              }, 500);
            }
          }
          this.fishData.list.push(fish);
        })
        y+=fishHeight;
      });
    },
    drawFish (times) {
      this.fishData.list.forEach((fish, index) => {
        if (!fish.isDead) {
          // this.canvas.ctx.fillStyle = fish.color;
          // this.canvas.ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
          // 渲染鱼图片
          this.canvas.ctx.drawImage(fish.item.img, fish.item.x, fish.item.y, fish.item.width, fish.item.height)
          times && fish.item.play()
        }
        if (fish.hit.isShow) {
          this.canvas.ctx.drawImage(fish.hit.img, fish.hit.x, fish.hit.y, fish.hit.width, fish.hit.height)
        }
      });
    },
    // 初始化枪数据
    initGun () {
      this.gunData.x = this.canvas.width / 2 - this.gunData.width / 2;
      this.gunData.y = this.canvas.height - this.toCurPX(45) - this.gunData.height;
      this.gunData.centerX = this.canvas.width / 2;
      this.gunData.centerY = this.canvas.height - this.toCurPX(45) - this.gunData.height / 2;
      this.gunData.fishImg = this.imgs.bullet[this.gunData.type];
      console.log(this.gunData.type);
      this.gunData.imgs = this.imgs.gun.map((img, index) => {
        let width = this.toCurPX(img.width);
        let height = width / img.width * img.height;
        let x = this.canvas.width / 2 - width / 2;
        let y = this.canvas.height - height;
        switch (index) {
          case 0:
            y -= this.toCurPX(57);
            break;
          case 1:
            y -= this.toCurPX(81);
            img = this.imgs.bullet[this.gunData.type]
            break;
          case 2:
            y -= this.toCurPX(45);
            break;
        }
        return {
          width,
          height,
          x,
          y,
          img
        }
      });
      let  textBgSrc = { // 圆角矩形左上角坐标
        height: this.toCurPX(30),
        x: this.toCurPX(422),
        y: this.canvas.height - this.toCurPX(108)
      }
      this.gunData.text = {
        getText: () => this.bulletData.num - this.bulletData.use,
        fillStyle: '#ffffff',
        strokeStyle: '#286812',
        x: this.toCurPX(430),
        y: this.canvas.height - this.toCurPX(85)
      }
      this.gunData.textBg = {
        fillStyle: '#fff',
        getData: (index) => {
          let fontWidth = this.canvas.ctx.measureText(this.bulletData.num - this.bulletData.use).width;
          if (index === 0) {
            return [textBgSrc.x + this.toCurPX(15), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2 * 3, Math.PI / 2, true]
          } else {
            return [textBgSrc.x + fontWidth, textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2, Math.PI / 2 * 3, true]
          }
        }
      };
      this.gunData.name = {
        text: this.names[this.gunData.type],
        fillStyle: '#ffffff',
        strokeStyle: '#286812',
        fontSize: 26,
        x: this.gunData.centerX - this.toCurPX(35),
        y: this.gunData.centerY + this.toCurPX(65),
      }
    },
    // 渲染粽子
    drawGun () {
      let ctx = this.canvas.ctx;
      this.canvas.ctx.font = `bold ${this.toCurPX(22)}px PingFang SC`;
      this.gunData.imgs.forEach((img, index) => {
        if (index === 1) {
          ctx.drawImage(this.gunData.fishImg, img.x, img.y, img.width, img.height);
        } else {
          ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
        }
      });

      let {textBg, text, type, name} = this.gunData;
      this.canvas.ctx.beginPath();
      this.canvas.ctx.fillStyle = textBg.fillStyle;
      this.canvas.ctx.arc(...textBg.getData(0));
      // this.canvas.ctx.fillRect(...textBg.getData(1));
      this.canvas.ctx.arc(...textBg.getData(1));
      this.canvas.ctx.fill();
      this.canvas.ctx.closePath();
      this.canvas.ctx.lineWidth = this.toCurPX(1);
      this.canvas.ctx.fillStyle = text.fillStyle;
      this.canvas.ctx.strokeStyle = text.strokeStyle;
      this.canvas.ctx.fillText(text.getText(), text.x, text.y);
      this.canvas.ctx.strokeText(text.getText(), text.x, text.y);

      this.canvas.ctx.font = `bold ${this.toCurPX(26)}px PingFang SC`;
      this.canvas.ctx.lineWidth = this.toCurPX(1);
      this.canvas.ctx.fillStyle = text.fillStyle;
      this.canvas.ctx.strokeStyle = text.strokeStyle;
      this.canvas.ctx.fillText(name.text, name.x, name.y);
      this.canvas.ctx.strokeText(name.text, name.x, name.y);
      
    },
    // 初始化背包
    initBag () {
      let num = 0;
      let img = this.imgs.bag[0];
      let width = this.toCurPX(img.width );
      let height = width / img.width * img.height;
      let x = this.toCurPX(24);
      let y = this.canvas.height - height - this.toCurPX(39);
      let textBgSrc = { // 圆角矩形左上角坐标
        height: this.toCurPX(30),
        width: this.toCurPX(50),
        x: this.toCurPX(51),
        y: this.canvas.height - this.toCurPX(60)
      }
      let bgColor = '#ffffffdd';
      let textColor = `#0834AE`;
      let fontSize = this.toCurPX(22);
      let textBg = [
        [textBgSrc.x + this.toCurPX(15), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2 * 3, Math.PI / 2, true],
        [textBgSrc.x + this.toCurPX(65), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2, Math.PI / 2 * 3, true]
      ]
      let getFishStyle = {
        srcY: this.canvas.height - this.toCurPX(39 + 127),
        x: this.toCurPX(24 + 67),
        y: this.canvas.height - this.toCurPX(39 + 127),
        text: '+1',
        fontSize: this.toCurPX(30),
        fillStyle: 'rgba(255,255,255,1)',
        show: false,
        timer: null
      }
      // 显示+1
      let showGetStyle = () => {
        if (getFishStyle.show) return;
        let i = 60;
        getFishStyle.fillStyle = 'rgba(255,255,255,1)';
        getFishStyle.y = getFishStyle.srcY;
        getFishStyle.show = true;
        clearInterval(getFishStyle.timer);
        getFishStyle.timer = this.fps60Timer(() => {
          i--;
          getFishStyle.fillStyle = `rgba(255,255,255,${i / 60})`;
          getFishStyle.y-=this.toCurPX(1);
          if (i <= 0) {
            clearInterval(getFishStyle.timer)
            getFishStyle.show = false;
          }
        })
      }
      this.bagData = {img, width, height, x, y, num, textBg, bgColor, textColor, fontSize, getFishStyle, showGetStyle};
    },
    // 渲染粽子炮台
    drawBag () {
      this.canvas.ctx.beginPath();
      this.canvas.ctx.drawImage(this.bagData.img, this.bagData.x, this.bagData.y, this.bagData.width, this.bagData.height)
      this.canvas.ctx.fillStyle = this.bagData.bgColor;
      this.canvas.ctx.arc(...this.bagData.textBg[0]);
      this.canvas.ctx.arc(...this.bagData.textBg[1]);
      this.canvas.ctx.fill();
      this.canvas.ctx.fillStyle =  this.bagData.textColor;
      this.canvas.ctx.font = `bold ${this.bagData.fontSize}px PingFang SC`;
      let fontWidth = this.canvas.ctx.measureText(this.bagData.num).width;
      this.canvas.ctx.fillText(this.bagData.num, this.toCurPX(91) - fontWidth / 2, this.canvas.height - this.toCurPX(37));
      this.canvas.ctx.closePath();
      if (this.bagData.getFishStyle.show) {
        this.canvas.ctx.font = `bold ${this.bagData.getFishStyle.fontSize}px PingFang SC`;
        this.canvas.ctx.fillStyle = this.bagData.getFishStyle.fillStyle;
        this.canvas.ctx.fillText(this.bagData.getFishStyle.text, this.bagData.getFishStyle.x, this.bagData.getFishStyle.y);
      }
    },
    // 设置子弹数量
    setBulletNum (num) {
      this.bulletData.num = num;
      this.initGun();
    },
    // 设置鱼是否死亡
    setFishDead (flag) {
      this.fishData.targFishDead = flag;
    },
    // 设置子弹类型
    setBulletType (level) {
      this.gunData.type = level - 1;
      let timer = setInterval(() => {
        if (this.gunData && this.gunData.imgs && this.gunData.imgs[1] && this.gunData.imgs[1].img) {
          this.initGun();
          // this.gunData.imgs[1].img = this.imgs.bullet[type];
          this.draw();
          clearInterval(timer);
        }
      }, 10)
    },
    // 生成子弹
    initBullet (targX, targY) {
      this.bulletData.use++;
      // 在弹道上的鱼
      // let targetFish = this.getXYofFish(targX, targY);
      let routerFish = this.forecastRoute(targX, targY);
      let bullet = {
        centerX: this.gunData.centerX,
        centerY: this.gunData.centerY,
        x: this.gunData.centerX - this.bulletData.width / 2,
        y: this.gunData.centerY - this.bulletData.height / 2,
        x1: this.gunData.centerX + this.bulletData.width / 2,
        y1: this.gunData.centerY + this.bulletData.height / 2,
        targX: targX - this.bulletData.width / 2, // 目标坐标
        targY: targY - this.bulletData.height / 2,
        curX: this.gunData.centerX - this.bulletData.width / 2, // 当前坐标
        curY: this.gunData.centerY - this.bulletData.height,
        timmer: null,
        invalid: false, // 子弹失效
        fishList: routerFish, // 弹道上的鱼列表
        img: this.imgs.bullet[this.gunData.type],
        deg: Math.atan2((targY - this.gunData.centerY), (targX - this.gunData.centerX)) + Math.PI / 2
      }
      let s = 3; // 小球到终点所用时间
      let x = bullet.targX - bullet.x;
      let y = bullet.targY - bullet.y;
      // 每帧速度
      let stepX = x * 60 / (1000 * s);
      let stepY = y * 60 / (1000 * s);
      bullet.timmer = this.fps60Timer(() => {
        // 改变子弹坐标
        bullet.x += stepX;
        bullet.y += stepY;
        bullet.x1 += stepX;
        bullet.y1 += stepY;
        bullet.centerX += stepX;
        bullet.centerY += stepY;
        let overstepX = stepX >= 0 ? bullet.x >= bullet.targX : bullet.x <= bullet.targX;
        let overstepY = bullet.y <= bullet.targY;
        // 遍历经过哪些鱼，跳过打过的鱼
        for (let fish of routerFish) {
          // 坐標碰撞, 魚沒死
          if (this.rectCollision(bullet, fish) && !fish.isDead && this.canvas.runing) {
              // fish.isDead = true; // 鱼死亡
              bullet.invalid = true; // 让子弹失效
              if (this.fishData.targFishDead) {
                console.log('死掉的鱼', fish);
                this.bagData.showGetStyle() // 显示+1
                fish.hit.dead();
                this.bagData.num++;
              } else {
                fish.hit.noDead();
              }
              break;
          }
        }
        // 到达终点或打到鱼后消失
        if (overstepX && overstepY || bullet.invalid) {
          clearInterval(bullet.timmer);
          this.bulletData.list.splice(this.bulletData.list.indexOf(bullet), 1);
        }
      });
      return bullet;
    },
    drawBullet () {
      this.canvas.ctx.fillStyle = this.bulletData.color;
      this.bulletData.list.forEach(item => {
        this.canvas.ctx.save();
        this.canvas.ctx.translate(item.centerX, item.centerY);
        this.canvas.ctx.rotate(item.deg);
        this.canvas.ctx.drawImage(item.img, -this.bulletData.width / 2, -this.bulletData.height / 2, this.bulletData.width, this.bulletData.height);
        this.canvas.ctx.restore();
        // this.canvas.ctx.fillRect(item.x, item.y, this.bulletData.width, this.bulletData.height);
      })
    },
    // 60帧定时器
    fps60Timer (fn, fps = 60) {
      return setInterval(fn, 1000 / fps);
    },
    // 渲染画布
    draw (times) {
      if (!this.canvas.ctx) {
        return
      }
      this.canvas.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      // this.canvas.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      // this.canvas.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      // 渲染背包
      this.drawBag();
      // 绘制枪
      this.drawGun();
      // 绘制鱼
      this.drawFish(times);
      // 绘制子弹
      this.drawBullet();
      if (times) {
        // 记录时间戳
        if (!this.timeData.timestamp) this.timeData.timestamp = times;
        this.timeData.runTime = times - this.timeData.timestamp;
        this.timeData.time = this.timeData.gameLength - this.timeData.runTime / 1000;
        this.canvas.animationFrame = requestAnimationFrame(this.draw);
        if (this.timeData.time <= 0 || this.bagData.num >= this.fishData.list.length) { // 剩余时间小于0
          this.stop()
        }
      }
    },
    // 获取坐标点上的鱼
    getXYofFish (x, y) {
      let atFish = this.fishData.list.filter(item => x >= item.x && x < item.x1 && y > item.y && y <= item.y1);
      return atFish.length ? atFish[0] : null;
    },
    // 点击画布
    clickCanvas (event) {
      if (!this.canvas.runing || this.bulletData.curBullet) return;
      if (this.bulletData.use >= this.bulletData.num) return;
      let lineEndFish = this.getXYofFish(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio, this.canvas.height + 100);
      if (!lineEndFish || lineEndFish && lineEndFish.isDead) return;
      // alert(`${event.offsetX}, ${event.offsetY}`);
      // 子弹终点
      let bulletEnd = this.distanceToXY(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio, this.canvas.height + 100);

      let bullet = this.initBullet(bulletEnd.x, bulletEnd.y);
      let targFish = {};
      for (let i =0; i< bullet.fishList.length; i++) {
        if (bullet.fishList[i].isDead === false){
          targFish = bullet.fishList[i];
          break;
        }
      }
      if (lineEndFish !== targFish) {
        this.$toast('該目標前面有障礙, 優先清除障礙')
      }
      console.log('将死之鱼', targFish);
      this.$emit('fire', targFish);
      this.bulletData.curBullet = bullet;
      this.bulletData.list.push(bullet);
    },
    // 计算在子弹路线上的鱼
    forecastRoute (targX, targY) {
      let length = Math.ceil(Math.sqrt(Math.pow(targX - this.gunData.centerX, 2) + Math.pow(targY - this.gunData.centerY, 2)));
      let fishList = [];
      Array.from(new Array(length), (v, i) => {
        let dot = this.distanceToXY(targX, targY, i);
        let x = dot.x - this.bulletData.width / 2;
        let y = dot.y - this.bulletData.height / 2;
        let x1 = x + this.bulletData.width;
        let y1 = y + this.bulletData.height;
        // this.canvas.ctx.fillRect(x1, y1, this.bulletData.width, this.bulletData.height);
        let atFish = this.fishData.list.filter(fish => {
          return this.rectCollision({x, y, x1, y1}, fish)
        })
        atFish.forEach(fish => {
          if (fishList.indexOf(fish) === -1) {
            fishList.push(fish);
          }
        })
      })
      return fishList;
    },
    // 计算枪中心点到目标点间,
    distanceToXY (targX, targY, length) {
      let ox = this.gunData.centerX;
      let oy = this.gunData.centerY;
      let x = targX - this.gunData.centerX;
      let y = targY - this.gunData.centerY;
      let proportion = length / (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let x1 = ox + x * proportion;
      let y1 = oy + y * proportion;
      return {x: x1, y: y1}
    },
    // 碰撞计算
    rectCollision (obj, obj1) {
      let x = Math.max.apply(null, [obj.x, obj1.x]) <= Math.min.apply(null, [obj.x1, obj1.x1]);
      let y = Math.max.apply(null, [obj.y, obj1.y]) <= Math.min.apply(null, [obj.y1, obj1.y1]);
      if (x && y) {
        return true
      }
      return false;
    },
    // 开始游戏
    start () {
      this.canvas.runing = true;
      this.timeData.timestamp = 0;
      this.canvas.animationFrame = requestAnimationFrame(this.draw);
      this.$emit('gameStart');
    },
    // 停止游戏
    stop () {
      // this.init();
      this.canvas.runing = false;
      // this.timeData.time = 20;
      cancelAnimationFrame(this.canvas.animationFrame);
      this.$emit('gameOver', this.gunData.text.getText());
    }
  }
}
</script>
<style lang="scss" scoped>
// @import '~@style/common.scss';
.game {
  height: calc(100% - 180px);
  position: relative;
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    background: #0008;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    .countDownNum {
      height: 165px;
      img {
        height: 100%;
        width: auto;
      }
    }
    .countDownText {
      width: 242px;
    }
  }
  .countDown {
    // @include text-shadow-stroke(#9A5215, 1px);
    // @include setBg('~@img/bgScrollText.png');
    // @include marginCenter(-10px);
    height: 96px;
    width: 480px;
    font-size: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 5px;
    .bar {
      margin-left: 10px; 
      width: 280px;
      height: 28px;
      background: linear-gradient(0deg,#116676 0%, #203f48 100%);
      border-radius: 14px;
      box-shadow: 1px 1px 9px 0px rgba(10,35,41,0.44) inset;
      overflow: hidden;
      .barBg {
        height: 100%;
        border-radius: 24px;
        // background: url(~@img/game/barBg.png) repeat-x top;
      }
    }
  }
  .gameCanvas {
    user-select: none;
    height: calc(100% - 96px);
    width: 750px;
    // height: 800px;
  }
  .parts {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
    .taunt {
      position: absolute;
      width: 200px;
      background: #fff9;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #666;
      transform: translate(50%, 50%);
      display: none;
    }
  }
  button {
    font-size: 28px;
  }
}
</style>