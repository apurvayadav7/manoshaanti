import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const SIZE = 11;

function buildMaze(size = SIZE) {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => 1));

  function carve(x, y) {
    grid[y][x] = 0;
    const dirs = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ].sort(() => Math.random() - 0.5);

    dirs.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx <= 0 || ny <= 0 || nx >= size - 1 || ny >= size - 1) return;
      if (grid[ny][nx] === 0) return;
      grid[y + dy / 2][x + dx / 2] = 0;
      carve(nx, ny);
    });
  }

  carve(1, 1);
  grid[1][1] = 0;
  grid[size - 2][size - 2] = 0;
  return grid;
}

export default function MazeGame({ onComplete }) {
  const [maze, setMaze] = useState(() => buildMaze());
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [won, setWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const exit = useMemo(() => ({ x: SIZE - 2, y: SIZE - 2 }), []);

  useEffect(() => {
    if (won) return undefined;
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [won]);

  function reset() {
    setMaze(buildMaze());
    setPlayer({ x: 1, y: 1 });
    setWon(false);
    setSeconds(0);
  }

  function tryMove(dx, dy) {
    if (won) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) return;
    if (maze[ny][nx] === 1) return;

    const next = { x: nx, y: ny };
    setPlayer(next);

    if (next.x === exit.x && next.y === exit.y) {
      setWon(true);
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'ArrowUp') tryMove(0, -1);
      if (event.key === 'ArrowDown') tryMove(0, 1);
      if (event.key === 'ArrowLeft') tryMove(-1, 0);
      if (event.key === 'ArrowRight') tryMove(1, 0);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="soft-panel game-panel maze-panel">
      <div className="game-panel-head">
        <h3>Maze Game</h3>
        <div className="game-meta-chip">{won ? 'Completed' : `${seconds}s`}</div>
      </div>
      <p>Navigate from start to exit using arrow keys or controls.</p>

      <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {maze.flatMap((row, y) => row.map((cell, x) => {
          const isPlayer = player.x === x && player.y === y;
          const isExit = exit.x === x && exit.y === y;
          return (
            <div
              key={`${x}-${y}`}
              className={`maze-cell ${cell === 1 ? 'wall' : 'path'} ${isExit ? 'exit' : ''}`}
            >
              {isPlayer ? <motion.span className="maze-player" layoutId="maze-player">🙂</motion.span> : null}
            </div>
          );
        }))}
      </div>

      <div className="maze-controls">
        <button className="pill-btn" type="button" onClick={() => tryMove(0, -1)}>↑</button>
        <div className="maze-controls-row">
          <button className="pill-btn" type="button" onClick={() => tryMove(-1, 0)}>←</button>
          <button className="pill-btn" type="button" onClick={() => tryMove(1, 0)}>→</button>
        </div>
        <button className="pill-btn" type="button" onClick={() => tryMove(0, 1)}>↓</button>
      </div>

      {won ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row-gap">
          <p>You escaped the maze calmly. +20 reward points.</p>
          <div className="row-gap">
            <button className="pill-btn primary" type="button" onClick={() => onComplete?.('maze_game')}>
              Claim Reward Points
            </button>
            <button className="pill-btn" type="button" onClick={reset}>Play Again</button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
