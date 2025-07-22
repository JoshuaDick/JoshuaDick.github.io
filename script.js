const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let w, h, balls = [];
let mouse = {
	x: undefined,
	y: undefined
}
let rgb = [
	"rgb(26, 188, 156)",
	"rgb(46, 204, 113)",
	"rgb(52, 152, 219)",
	"rgb(155, 89, 182)",
	"rgb(241, 196, 15)",
	"rgb(230, 126, 34)",
	"rgb(231, 76, 60)"
]

function init() {
	resizeReset();
	animationLoop();
}

function resizeReset() {
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
}

function animationLoop() {
	ctx.clearRect(0, 0, w, h);
	ctx.globalCompositeOperation = 'lighter';
	drawBalls();

	let temp = [];
	for (let i = 0; i < balls.length; i++) {
		if (balls[i].time <= balls[i].ttl) {
			temp.push(balls[i]);
		}
	}
	balls = temp;

	requestAnimationFrame(animationLoop);
}

function drawBalls() {
	for (let i = 0; i < balls.length; i++) {
		balls[i].update();
		balls[i].draw();
	}
}

function mousemove(e) {
	mouse.x = e.x;
	mouse.y = e.y;

	for (let i = 0; i < 3; i++) {
		balls.push(new Ball());
	}	
}

function mouseout() {
	mouse.x = undefined;
	mouse.y = undefined;
}

function getRandomInt(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}

function easeOutQuart(x) {
	return 1 - Math.pow(1 - x, 4);
}

class Ball {
	constructor() {
		this.start = {
			x: mouse.x + getRandomInt(-20, 20),
			y: mouse.y + getRandomInt(-20, 20),
			size: getRandomInt(30, 40)
		}
		this.end = {
			x: this.start.x + getRandomInt(-300, 300),
			y: this.start.y + getRandomInt(-300, 300)
		}

		this.x = this.start.x;
		this.y = this.start.y;
		this.size = this.start.size;

		this.style = rgb[getRandomInt(0, rgb.length - 1)];

		this.time = 0;
		this.ttl = 120;
	}
	draw() {
		ctx.fillStyle = this.style;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	update() {
		if (this.time <= this.ttl) {
			let progress = 1 - (this.ttl - this.time) / this.ttl;

			this.size = this.start.size * (1 - easeOutQuart(progress));
			this.x = this.x + (this.end.x - this.x) * 0.01;
			this.y = this.y + (this.end.y - this.y) * 0.01;
		}
		this.time++;
	}
}

window.addEventListener("DOMContentLoaded", init);
function updateTime() {
  const now = new Date();
  const formatted = now.toLocaleTimeString();
  const timeDiv = document.getElementById("currentTime");
  if (timeDiv) {
    timeDiv.textContent = `${formatted}`;
  }
}

// Update every second
setInterval(updateTime, 1000);
updateTime(); // Call immediately
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseout", mouseout);
window.addEventListener("DOMContentLoaded", () => {
  const welcomeDiv = document.getElementById("welcome");
  const message = "Welcome";
  let index = 0;

  function typeChar() {
    if (index < message.length) {
      welcomeDiv.textContent += message.charAt(index);
      index++;
      setTimeout(typeChar, 150);
    }
  }

  typeChar();
});


function openPage() {
  const page = document.getElementById("fs");
  if (page) {
    page.style.opacity = "1";
    page.style.pointerEvents = "auto";
  }
      fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      const ipDiv = document.getElementById("ipAddress");
	  if (ipDiv) {
		ipDiv.textContent = `You are ${data.ip}`;
	  }
}).catch(() => {
      const ipDiv = document.getElementById("ipAddress");
      if (ipDiv) {
        ipDiv.textContent = `Who are you?`;
      }
    });
}

function closePage() {
  const page = document.getElementById("fs");
  if (page) {
    page.style.opacity = "0";
    page.style.pointerEvents = "none";
  }

}


canvas.addEventListener("mousedown", (e) => {
	if (e.button===1) {
  const rect = canvas.getBoundingClientRect();
  const x = rect.right-e.clientX;
  const y = rect.bottom-e.clientY;


  if (x < 100 && y < 100) {
    openPage();
  }
}
});
