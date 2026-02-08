import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  canvasWidth = 420;
  canvasHeight = 420;
  private cellSize = 20;
  private cols = Math.floor(this.canvasWidth / this.cellSize);
  private rows = Math.floor(this.canvasHeight / this.cellSize);

  private ctx: CanvasRenderingContext2D | null = null;
  private loopId: number | null = null;

  snake: Point[] = [];
  food: Point = { x: 0, y: 0 };
  dir: Point = { x: 1, y: 0 };
  nextDir: Point = { x: 1, y: 0 };

  score = 0;
  best = 0;
  running = false;
  gameOver = false;
  speedMs = 120;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.loadBest();
    this.reset();
    this.draw();
  }

  ngOnDestroy(): void {
    this.stopLoop();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.gameOver = false;
    this.startLoop();
  }

  pause(): void {
    this.running = false;
    this.stopLoop();
  }

  toggle(): void {
    if (this.running) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset(): void {
    this.pause();
    this.score = 0;
    this.gameOver = false;
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.placeFood();
    this.draw();
  }

  setDirection(dx: number, dy: number): void {
    if (this.snake.length > 1 && dx === -this.dir.x && dy === -this.dir.y) {
      return;
    }
    this.nextDir = { x: dx, y: dy };
  }

  changeSpeed(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(value)) return;
    this.speedMs = value;
    if (this.running) {
      this.startLoop();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'spacebar') {
      event.preventDefault();
      this.toggle();
      return;
    }

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case 'arrowup':
      case 'w':
        this.setDirection(0, -1);
        break;
      case 'arrowdown':
      case 's':
        this.setDirection(0, 1);
        break;
      case 'arrowleft':
      case 'a':
        this.setDirection(-1, 0);
        break;
      case 'arrowright':
      case 'd':
        this.setDirection(1, 0);
        break;
      default:
        break;
    }
  }

  private startLoop(): void {
    this.stopLoop();
    this.loopId = window.setInterval(() => this.tick(), this.speedMs);
  }

  private stopLoop(): void {
    if (this.loopId !== null) {
      clearInterval(this.loopId);
      this.loopId = null;
    }
  }

  private tick(): void {
    if (!this.running || this.gameOver) return;

    this.dir = { ...this.nextDir };
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    if (head.x < 0 || head.y < 0 || head.x >= this.cols || head.y >= this.rows) {
      this.endGame();
      return;
    }

    if (this.snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 1;
      this.updateBest();
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  private endGame(): void {
    this.gameOver = true;
    this.running = false;
    this.stopLoop();
    this.updateBest();
    this.draw();
  }

  private placeFood(): void {
    const maxAttempts = this.cols * this.rows;
    for (let i = 0; i < maxAttempts; i += 1) {
      const candidate = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      };
      const collision = this.snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
      if (!collision) {
        this.food = candidate;
        return;
      }
    }

    this.food = { x: 0, y: 0 };
  }

  private draw(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.fillStyle = '#0b1b10';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.strokeStyle = 'rgba(90, 160, 90, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * this.cellSize + 0.5, 0);
      ctx.lineTo(x * this.cellSize + 0.5, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.cellSize + 0.5);
      ctx.lineTo(this.canvasWidth, y * this.cellSize + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = '#baff5a';
    ctx.shadowColor = 'rgba(186, 255, 90, 0.55)';
    ctx.shadowBlur = 8;
    ctx.fillRect(
      this.food.x * this.cellSize + 2,
      this.food.y * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );
    ctx.shadowBlur = 0;

    this.snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#e7ff9c' : '#7be36c';
      ctx.fillRect(
        segment.x * this.cellSize + 1,
        segment.y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );

      if (isHead) {
        ctx.fillStyle = '#20451f';
        ctx.fillRect(segment.x * this.cellSize + 6, segment.y * this.cellSize + 6, 4, 4);
        ctx.fillRect(segment.x * this.cellSize + 11, segment.y * this.cellSize + 6, 4, 4);
      }
    });
  }

  private loadBest(): void {
    try {
      const stored = window.localStorage.getItem('snake-best');
      if (stored) {
        this.best = Number(stored) || 0;
      }
    } catch {
      this.best = 0;
    }
  }

  private updateBest(): void {
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem('snake-best', String(this.best));
      } catch {
        // ignore storage errors
      }
    }
  }
}
