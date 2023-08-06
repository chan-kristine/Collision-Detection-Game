// main canvas
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

// canvas for color detection
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

// settings and container
let gameSpeed = 4; 
let score = 0;
let gameOver = false;
let timeToNextEnemy = 0;
let enemyInterval = 1200;
let lastTime = 0; 
let enemies = []; 
let explosions = []; 
let particles = [];
ctx.font = '50px Impact';

// class instances
class Enemy {
    constructor(){
        this.spriteWidth = 225;
        this.spriteHeight = 176;
        this.sizeModifier = Math.random()* 0.5 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 7+ 5;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = './images/ghost.png'
        this.frame = 0;
        this.maxFrame = 18;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 70 + 70;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail = Math.random() > 0.5;

    }
    update(deltaTime){
        if (score > 15) {
            this.image.src = './images/ghost.png'
            this.spriteWidth = 273
            this.spriteHeight = 282
            this.maxFrame = 18;
            this.directionX = (Math.random() * 7 + 5) + 4;
            enemyInterval = 1200;
        }
        
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY *= -1;
        }

        this.x -= this.directionX;
        this.y += this.directionY;

        if (this.x < 0 - this.width) this.markedForDeletion = true;
        
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;

            if (this.hasTrail) {
                for (let i = 0; i < 5; i++){
                    particles.push(new Particles(this.x, this.y, this.width, this.color))
                }
            }
        }
        if (this.x < 0 - this.width) gameOver = true; // GAMEOVER


    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height); 

        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width,this.height);
    }
}

class Layer {
    constructor(image, speedModifier, gameWidth, gameHeight){
        this.x = 0;
        this.y = 0;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 3334;
        this.height = 1667;
        this.image = image
        this.speedModifier = speedModifier
        this.speed = gameSpeed * speedModifier
    }
    update() {
        this.speed = gameSpeed * this.speedModifier;
        if (this.x <= -this.gameWidth){
            this.x = 0
        }
        this.x -= this.speed; 
    }
    draw() {
        ctx.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.gameWidth, this.gameHeight)
        ctx.drawImage(this.image, 0, 0, this.width, this.height, this.x + this.gameWidth, this.y, this.gameWidth, this.gameHeight)
    }
}

class Explosions {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = './images/explosion.png'
        this.spriteWidth = 64;
        this.spriteHeight = 68;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = './images/boom.wav'
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;

    }
    update(deltaTime){
        if (this.frame === 0) this.sound.play(); 
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval){ 
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5 ) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)
    } 
}

class Particles {
    constructor(x, y, size, color) {
        this.size = size
        this.x = x + this.size/2 + Math.random() * 50 - 25;
        this.y = y + this.size/2;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 10;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.5;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath(); 
        ctx.fillStyle = this.color;
        ctx.rect(this.x, this.y, this.radius, this.radius);
        ctx.fill();
        ctx.restore();
    }
}

// PARALLAX BACKGROUNDS
const backgroundLayer1 = new Image();
const backgroundLayer2 = new Image();
const backgroundLayer3 = new Image();
const backgroundLayer4 = new Image();


backgroundLayer1.src = './images/1.png'
backgroundLayer2.src = './images/2.png'
backgroundLayer3.src = './images/3.png'
backgroundLayer4.src = './images/4.png'


const layer1 = new Layer(backgroundLayer1, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
const layer2 = new Layer(backgroundLayer2, 0.3, CANVAS_WIDTH, CANVAS_HEIGHT)
const layer3 = new Layer(backgroundLayer3, 0.3, CANVAS_WIDTH, CANVAS_HEIGHT)
const layer4 = new Layer(backgroundLayer4, 0.2, CANVAS_WIDTH, CANVAS_HEIGHT)


const gameObjects = [layer1, layer2, layer3, layer4]

// functions
const scoreBoard= document.getElementById('score');
const gameOverBoard = document.getElementById('gameOver');
const audio = new Audio('./images/horror.mp3')
const finalScore = document.getElementById('final_score')
audio.play();

function drawScore(){
    scoreBoard.innerHTML = "Score: " + score
}

function drawGameOver(){
    gameOverBoard.style.display = 'grid';
    finalScore.innerHTML = score
    audio.pause();

}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1); 
    const pc = detectPixelColor.data;

    enemies.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) { 
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosions(object.x, object.y, object.width))
        }
    })
})

function animate(timestamp){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp; 
    timeToNextEnemy += deltaTime 

    gameObjects.forEach(object => {
        object.update();
        object.draw();
    })

    if (timeToNextEnemy > enemyInterval) { 
        enemies.push(new Enemy());
        timeToNextEnemy = 0;
        enemies.sort(function(a,b){
            return a.width - b.width
        })
    };

    drawScore();

    [...particles, ...enemies, ...explosions].forEach(object => object.update(deltaTime));
    [...particles, ...enemies, ...explosions].forEach(object => object.draw())
    enemies = enemies.filter(object => !object.markedForDeletion) 
    explosions = explosions.filter(object => !object.markedForDeletion)
    particles = particles.filter(object => !object.markedForDeletion)

    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver()
        
}

animate(0);