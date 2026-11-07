"use client";

import { useState } from "react";

type Connection = [string, string];

type RankingItem = {
  node: string;
  eigenvector: number;
  influence: number;
};

export default function NetworkPage() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // ---------------------------------------------------------
  // NETWORK CONTROLS
  // ---------------------------------------------------------

  const addNode = () => {
    if (nodes.length >= 26) return;

    let nextNode = "";

    for (let i = 0; i < 26; i++) {
      const candidate = String.fromCharCode(65 + i);

      if (!nodes.includes(candidate)) {
        nextNode = candidate;
        break;
      }
    }

    if (!nextNode) return;

    setNodes([...nodes, nextNode]);
  };

  const resetNetwork = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
  };

  const handleNodeClick = (node: string) => {
    if (selectedNode === null) {
      setSelectedNode(node);
      return;
    }

    if (selectedNode === node) {
      setSelectedNode(null);
      return;
    }

    const connectionExists = connections.some(
      ([a, b]) =>
        (a === selectedNode && b === node) ||
        (a === node && b === selectedNode)
    );

    if (!connectionExists) {
      setConnections([...connections, [selectedNode, node]]);
    }

    setSelectedNode(null);
  };

  const removeConnection = (connectionToRemove: Connection) => {
    const [nodeA, nodeB] = connectionToRemove;

    setConnections(
      connections.filter(
        ([a, b]) =>
          !(
            (a === nodeA && b === nodeB) ||
            (a === nodeB && b === nodeA)
          )
      )
    );
  };

  const removeNode = (nodeToRemove: string) => {
    setNodes(nodes.filter((node) => node !== nodeToRemove));

    setConnections(
      connections.filter(
        ([a, b]) =>
          a !== nodeToRemove && b !== nodeToRemove
      )
    );

    if (selectedNode === nodeToRemove) {
      setSelectedNode(null);
    }
  };

  // ---------------------------------------------------------
  // ADJACENCY MATRIX
  // ---------------------------------------------------------

  const adjacencyMatrix = nodes.map((node) =>
    nodes.map((otherNode) => {
      const connected = connections.some(
        ([a, b]) =>
          (a === node && b === otherNode) ||
          (a === otherNode && b === node)
      );

      return connected ? 1 : 0;
    })
  );

  // ---------------------------------------------------------
  // MATRIX RANK
  // Gaussian Elimination
  // ---------------------------------------------------------

  const calculateRank = (matrix: number[][]) => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      return 0;
    }

    const m = matrix.map((row) => [...row]);

    let rank = 0;
    let currentRow = 0;

    for (
      let column = 0;
      column < m[0].length && currentRow < m.length;
      column++
    ) {
      let pivot = currentRow;

      for (let i = currentRow + 1; i < m.length; i++) {
        if (
          Math.abs(m[i][column]) >
          Math.abs(m[pivot][column])
        ) {
          pivot = i;
        }
      }

      if (Math.abs(m[pivot][column]) < 1e-10) {
        continue;
      }

      [m[currentRow], m[pivot]] = [
        m[pivot],
        m[currentRow],
      ];

      for (let i = currentRow + 1; i < m.length; i++) {
        const factor =
          m[i][column] / m[currentRow][column];

        for (
          let j = column;
          j < m[0].length;
          j++
        ) {
          m[i][j] -=
            factor * m[currentRow][j];
        }
      }

      rank++;
      currentRow++;
    }

    return rank;
  };

  const matrixRank =
    adjacencyMatrix.length > 0
      ? calculateRank(adjacencyMatrix)
      : 0;

  // ---------------------------------------------------------
  // JACOBI EIGENVALUE METHOD
  // ---------------------------------------------------------

  const calculateEigenAnalysis = (
    matrix: number[][]
  ) => {
    const n = matrix.length;

    if (n === 0) {
      return {
        eigenvalue: 0,
        eigenvector: [],
      };
    }

    const a = matrix.map((row) => [...row]);

    const eigenvectors = Array.from(
      { length: n },
      (_, i) =>
        Array.from(
          { length: n },
          (_, j) => (i === j ? 1 : 0)
        )
    );

    const maxIterations = 100;

    for (
      let iteration = 0;
      iteration < maxIterations;
      iteration++
    ) {
      let p = 0;
      let q = n > 1 ? 1 : 0;
      let maxValue = 0;

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(a[i][j]) > maxValue) {
            maxValue = Math.abs(a[i][j]);
            p = i;
            q = j;
          }
        }
      }

      if (maxValue < 1e-10) {
        break;
      }

      const theta =
        0.5 *
        Math.atan2(
          2 * a[p][q],
          a[q][q] - a[p][p]
        );

      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      for (let i = 0; i < n; i++) {
        if (i !== p && i !== q) {
          const aip = a[i][p];
          const aiq = a[i][q];

          a[i][p] =
            cos * aip - sin * aiq;

          a[p][i] = a[i][p];

          a[i][q] =
            sin * aip + cos * aiq;

          a[q][i] = a[i][q];
        }
      }

      const app = a[p][p];
      const aqq = a[q][q];
      const apq = a[p][q];

      a[p][p] =
        cos * cos * app -
        2 * sin * cos * apq +
        sin * sin * aqq;

      a[q][q] =
        sin * sin * app +
        2 * sin * cos * apq +
        cos * cos * aqq;

      a[p][q] = 0;
      a[q][p] = 0;

      for (let i = 0; i < n; i++) {
        const vip = eigenvectors[i][p];
        const viq = eigenvectors[i][q];

        eigenvectors[i][p] =
          cos * vip - sin * viq;

        eigenvectors[i][q] =
          sin * vip + cos * viq;
      }
    }

    const eigenvalues = Array.from(
      { length: n },
      (_, i) => a[i][i]
    );

    let dominantIndex = 0;

    for (let i = 1; i < n; i++) {
      if (
        eigenvalues[i] >
        eigenvalues[dominantIndex]
      ) {
        dominantIndex = i;
      }
    }

    const eigenvalue =
      eigenvalues[dominantIndex];

    let eigenvector =
      eigenvectors.map(
        (row) => row[dominantIndex]
      );

    // Make the dominant component positive
    const largestComponent = Math.max(
      ...eigenvector.map((value) =>
        Math.abs(value)
      )
    );

    if (largestComponent > 0) {
      const index =
        eigenvector.findIndex(
          (value) =>
            Math.abs(value) ===
            largestComponent
        );

      if (eigenvector[index] < 0) {
        eigenvector =
          eigenvector.map(
            (value) => -value
          );
      }
    }

    return {
      eigenvalue,
      eigenvector,
    };
  };

  const eigenAnalysis =
    adjacencyMatrix.length > 0
      ? calculateEigenAnalysis(
          adjacencyMatrix
        )
      : {
          eigenvalue: 0,
          eigenvector: [],
        };

  // ---------------------------------------------------------
  // NORMALIZED INFLUENCE
  // ---------------------------------------------------------

  const totalEigenvectorValue =
    eigenAnalysis.eigenvector.reduce(
      (sum, value) =>
        sum + Math.max(0, value),
      0
    );

  const influenceScores =
    totalEigenvectorValue > 0
      ? eigenAnalysis.eigenvector.map(
          (value) =>
            Math.max(0, value) /
            totalEigenvectorValue
        )
      : eigenAnalysis.eigenvector.map(
          () => 0
        );

  // ---------------------------------------------------------
  // FINAL RANKING
  // ---------------------------------------------------------

  const rankings: RankingItem[] =
    nodes
      .map((node, index) => ({
        node,
        eigenvector:
          eigenAnalysis.eigenvector[
            index
          ] ?? 0,
        influence:
          influenceScores[index] ?? 0,
      }))
      .sort(
        (a, b) =>
          b.influence - a.influence
      );

  // ---------------------------------------------------------
  // NETWORK VISUAL POSITION
  // ---------------------------------------------------------

  const getNodePosition = (
    index: number
  ) => {
    const column = index % 4;
    const row = Math.floor(index / 4);

    return {
      x: 15 + column * 24,
      y: 25 + row * 30,
    };
  };

  // ---------------------------------------------------------
  // DEGREE CALCULATION
  // ---------------------------------------------------------

  const getNodeDegree = (
    node: string
  ) => {
    return connections.filter(
      ([a, b]) =>
        a === node || b === node
    ).length;
  };

  const totalInfluence =
    influenceScores.reduce(
      (sum, value) =>
        sum + value,
      0
    ) * 100;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-[#06080c] text-white">
      {/* -------------------------------------------------- */}
      {/* NAVIGATION */}
      {/* -------------------------------------------------- */}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#06080c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              NETRANK
            </h1>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-white/30">
              Network Influence Engine
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-white/30 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Mathematical Engine Active
          </div>
        </div>
      </nav>

      {/* -------------------------------------------------- */}
      {/* HERO */}
      {/* -------------------------------------------------- */}

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-400">
            Network Analysis System
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Discover influence
            <br />
            through mathematics.
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/40">
            Build a network, transform it into an
            adjacency matrix, analyze its rank and
            eigenstructure, and calculate the relative
            influence of every node.
          </p>
        </div>

        {/* Pipeline */}

        <div className="mt-10 grid gap-2 md:grid-cols-6">
          {[
            "Network",
            "Matrix",
            "Rank",
            "Eigen",
            "Influence",
            "Ranking",
          ].map((stage, index) => (
            <div
              key={stage}
              className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-400/70">
                0{index + 1}
              </div>

              <div className="mt-2 text-sm font-medium text-white/70">
                {stage}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* STATUS CARDS */}
      {/* -------------------------------------------------- */}

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Nodes
            </p>

            <div className="mt-3 text-3xl font-semibold">
              {nodes.length}
            </div>

            <p className="mt-1 text-xs text-white/30">
              Network entities
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Connections
            </p>

            <div className="mt-3 text-3xl font-semibold">
              {connections.length}
            </div>

            <p className="mt-1 text-xs text-white/30">
              Network relationships
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Matrix Rank
            </p>

            <div className="mt-3 text-3xl font-semibold text-blue-300">
              {matrixRank}
            </div>

            <p className="mt-1 text-xs text-white/30">
              Linear independence
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/30">
              Dominant λ
            </p>

            <div className="mt-3 text-3xl font-semibold text-blue-300">
              {nodes.length > 0
                ? eigenAnalysis.eigenvalue.toFixed(
                    3
                  )
                : "—"}
            </div>

            <p className="mt-1 text-xs text-white/30">
              Principal eigenvalue
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* NETWORK BUILDER */}
      {/* -------------------------------------------------- */}

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                Step 01
              </p>

              <h3 className="mt-2 text-3xl font-semibold">
                Build your network
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                Add nodes and connect them. Each
                relationship becomes an entry in the
                adjacency matrix.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={addNode}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                + Add Node
              </button>

              <button
                onClick={resetNetwork}
                className="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
              >
                ↻ Reset
              </button>
            </div>
          </div>

          {/* Instructions */}

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-400/10 bg-blue-400/5 px-4 py-3 text-sm text-white/50">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300">
              ?
            </span>

            {selectedNode ? (
              <span>
                Node{" "}
                <span className="font-semibold text-blue-300">
                  {selectedNode}
                </span>{" "}
                selected — click another node to
                connect them.
              </span>
            ) : (
              <span>
                Click one node, then another node to
                create a connection.
              </span>
            )}
          </div>

          {/* Canvas */}

          <div className="relative mt-5 min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#080b11]">
            {/* Grid */}

            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize:
                  "40px 40px",
              }}
            />

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-3xl text-white/20">
                    +
                  </div>

                  <h4 className="mt-5 text-lg font-medium">
                    Empty Network
                  </h4>

                  <p className="mt-2 text-sm text-white/30">
                    Add a node to start building.
                  </p>
                </div>
              </div>
            )}

            {/* SVG Connections */}

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {connections.map(
                ([nodeA, nodeB], index) => {
                  const indexA =
                    nodes.indexOf(nodeA);

                  const indexB =
                    nodes.indexOf(nodeB);

                  if (
                    indexA === -1 ||
                    indexB === -1
                  ) {
                    return null;
                  }

                  const positionA =
                    getNodePosition(indexA);

                  const positionB =
                    getNodePosition(indexB);

                  return (
                    <g key={index}>
                      <line
                        x1={positionA.x}
                        y1={positionA.y}
                        x2={positionB.x}
                        y2={positionB.y}
                        stroke="rgba(96,165,250,0.18)"
                        strokeWidth="1.2"
                      />

                      <line
                        x1={positionA.x}
                        y1={positionA.y}
                        x2={positionB.x}
                        y2={positionB.y}
                        stroke="rgba(96,165,250,0.55)"
                        strokeWidth="0.35"
                      />
                    </g>
                  );
                }
              )}
            </svg>

            {/* Nodes */}

            {nodes.map((node, index) => {
              const position =
                getNodePosition(index);

              const isSelected =
                selectedNode === node;

              const degree =
                getNodeDegree(node);

              return (
                <button
                  key={node}
                  onClick={() =>
                    handleNodeClick(node)
                  }
                  className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-semibold transition-all duration-200 ${
                    isSelected
                      ? "scale-110 border-blue-300 bg-blue-500/30 text-blue-200 shadow-[0_0_40px_rgba(59,130,246,0.45)]"
                      : "border-blue-400/40 bg-blue-500/10 text-blue-300 hover:scale-105 hover:border-blue-300/70 hover:bg-blue-500/20"
                  }`}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                  title={`Node ${node} • Degree ${degree}`}
                >
                  <span className="text-lg">
                    {node}
                  </span>

                  {degree > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/10 bg-[#10141c] px-1 text-[9px] text-white/50">
                      {degree}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Connections */}

          {connections.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    Active Connections
                  </h4>

                  <p className="mt-1 text-xs text-white/30">
                    Every connection contributes to
                    the adjacency matrix.
                  </p>
                </div>

                <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40">
                  {connections.length} total
                </span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {connections.map(
                  ([a, b], index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                    >
                      <span className="font-mono text-sm text-blue-300">
                        {a}{" "}
                        <span className="text-white/20">
                          ↔
                        </span>{" "}
                        {b}
                      </span>

                      <button
                        onClick={() =>
                          removeConnection([
                            a,
                            b,
                          ])
                        }
                        className="rounded-lg border border-red-400/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-400/10"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Node Management */}

          {nodes.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h4 className="text-sm font-semibold">
                    Node Management
                  </h4>

                  <p className="mt-1 text-xs text-white/30">
                    Removing a node also removes all
                    of its connections.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {nodes.map((node) => (
                    <button
                      key={node}
                      onClick={() =>
                        removeNode(node)
                      }
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300"
                    >
                      Remove {node}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------ */}
        {/* ADJACENCY MATRIX */}
        {/* ------------------------------------------------ */}

        {nodes.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                  Step 02
                </p>

                <h3 className="mt-2 text-3xl font-semibold">
                  Adjacency Matrix
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                  The network is transformed into a
                  mathematical matrix where each
                  non-zero entry represents a direct
                  connection.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 px-4 py-3 text-xs text-white/40">
                Dimension:{" "}
                <span className="font-mono text-blue-300">
                  {nodes.length} × {nodes.length}
                </span>
              </div>
            </div>

            <div className="mt-7 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-5">
              <table className="border-collapse text-center font-mono text-sm">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-white/20">
                      ·
                    </th>

                    {nodes.map((node) => (
                      <th
                        key={node}
                        className="px-5 py-4 font-semibold text-blue-300"
                      >
                        {node}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {adjacencyMatrix.map(
                    (row, rowIndex) => (
                      <tr key={nodes[rowIndex]}>
                        <th className="px-5 py-4 font-semibold text-blue-300">
                          {nodes[rowIndex]}
                        </th>

                        {row.map(
                          (
                            value,
                            columnIndex
                          ) => (
                            <td
                              key={columnIndex}
                              className={`border border-white/5 px-6 py-4 ${
                                value === 1
                                  ? "bg-blue-400/10 text-blue-300"
                                  : "text-white/20"
                              }`}
                            >
                              {value}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-xs text-white/30">
              <span>
                <span className="text-blue-300">
                  1
                </span>{" "}
                = connected
              </span>

              <span>
                <span className="text-white/30">
                  0
                </span>{" "}
                = not connected
              </span>

              <span>
                Symmetric matrix = undirected
                network
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* RANK ANALYSIS */}
        {/* ------------------------------------------------ */}

        {nodes.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
              Step 03
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
              Matrix Rank
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Gaussian elimination is used to determine
              the number of linearly independent rows or
              columns in the adjacency matrix.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                  Calculated Rank
                </p>

                <div className="mt-3 text-5xl font-semibold text-blue-300">
                  {matrixRank}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                  Matrix Size
                </p>

                <div className="mt-3 text-3xl font-semibold">
                  {nodes.length} ×{" "}
                  {nodes.length}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                  Rank Ratio
                </p>

                <div className="mt-3 text-3xl font-semibold">
                  {nodes.length > 0
                    ? (
                        matrixRank /
                        nodes.length
                      ).toFixed(2)
                    : "0"}
                </div>

                <p className="mt-1 text-xs text-white/30">
                  rank / dimension
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-5">
              <p className="font-mono text-sm text-blue-300">
                rank(A) = {matrixRank}
              </p>

              <p className="mt-3 text-sm leading-6 text-white/40">
                A higher rank indicates a greater number
                of linearly independent structural
                relationships represented by the matrix.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* EIGEN ANALYSIS */}
        {/* ------------------------------------------------ */}

        {nodes.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
              Step 04
            </p>

            <h3 className="mt-2 text-3xl font-semibold">
              Eigenvalue & Eigenvector Analysis
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              The Jacobi eigenvalue method is applied to
              the symmetric adjacency matrix to obtain the
              dominant eigenvalue and its corresponding
              eigenvector.
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {/* Eigenvalue */}

              <div className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                  Dominant Eigenvalue
                </p>

                <div className="mt-4 text-5xl font-semibold text-blue-300">
                  {eigenAnalysis.eigenvalue.toFixed(
                    4
                  )}
                </div>

                <div className="mt-5 rounded-xl border border-white/5 bg-black/20 px-4 py-3 font-mono text-sm text-white/40">
                  λ ={" "}
                  <span className="text-blue-300">
                    {eigenAnalysis.eigenvalue.toFixed(
                      4
                    )}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/30">
                  The largest eigenvalue of the adjacency
                  matrix is used to identify the principal
                  influence structure of the network.
                </p>
              </div>

              {/* Eigenvector */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                  Dominant Eigenvector
                </p>

                <div className="mt-5 space-y-2">
                  {eigenAnalysis.eigenvector.map(
                    (value, index) => (
                      <div
                        key={nodes[index]}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/5 text-xs font-semibold text-blue-300">
                            {nodes[index]}
                          </span>

                          <span className="text-xs text-white/30">
                            v{index + 1}
                          </span>
                        </div>

                        <span className="font-mono text-sm text-white/70">
                          {value.toFixed(4)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Formula */}

            <div className="mt-6 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                Fundamental Relationship
              </p>

              <div className="mt-4 font-mono text-2xl text-blue-300">
                Av = λv
              </div>

              <div className="mt-4 grid gap-3 text-sm text-white/40 md:grid-cols-3">
                <div>
                  <span className="font-mono text-blue-300">
                    A
                  </span>{" "}
                  = adjacency matrix
                </div>

                <div>
                  <span className="font-mono text-blue-300">
                    v
                  </span>{" "}
                  = eigenvector
                </div>

                <div>
                  <span className="font-mono text-blue-300">
                    λ
                  </span>{" "}
                  = eigenvalue
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* INFLUENCE RANKING */}
        {/* ------------------------------------------------ */}

        {nodes.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                  Step 05
                </p>

                <h3 className="mt-2 text-3xl font-semibold">
                  Influence Ranking
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                  The dominant eigenvector is normalized
                  into relative influence scores. Nodes are
                  then ordered from highest to lowest
                  influence.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                  Normalization
                </p>

                <p className="mt-1 font-mono text-sm text-emerald-300">
                  Σ Influence ={" "}
                  {totalInfluence.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Ranking Cards */}

            <div className="mt-7 space-y-3">
              {rankings.map(
                (item, index) => (
                  <div
                    key={item.node}
                    className={`rounded-2xl border p-5 transition ${
                      index === 0
                        ? "border-blue-400/20 bg-blue-400/[0.05]"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      {/* Position */}

                      <div className="flex items-center gap-4 md:w-52">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold ${
                            index === 0
                              ? "border-blue-400/30 bg-blue-400/10 text-blue-300"
                              : "border-white/10 bg-white/[0.03] text-white/40"
                          }`}
                        >
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/5 text-sm font-semibold text-blue-300">
                              {item.node}
                            </span>

                            {index === 0 && (
                              <span className="rounded-md border border-blue-400/20 bg-blue-400/5 px-2 py-1 text-[9px] uppercase tracking-wider text-blue-300">
                                Highest
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Eigenvector */}

                      <div className="md:w-40">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                          Eigenvector
                        </p>

                        <p className="mt-1 font-mono text-sm text-white/60">
                          {item.eigenvector.toFixed(
                            4
                          )}
                        </p>
                      </div>

                      {/* Influence */}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                            Influence
                          </p>

                          <p className="font-mono text-sm text-blue-300">
                            {(
                              item.influence *
                              100
                            ).toFixed(2)}
                            %
                          </p>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-blue-400 transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                item.influence *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Final Formula */}

            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/25">
                Influence Normalization
              </p>

              <p className="mt-3 font-mono text-sm text-blue-300">
                Influenceᵢ = vᵢ / Σv
              </p>

              <p className="mt-3 text-sm leading-6 text-white/30">
                Each eigenvector component is divided by
                the sum of all positive components so that
                the resulting influence scores form a
                normalized distribution.
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* FINAL SUMMARY */}
        {/* ------------------------------------------------ */}

        {nodes.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-blue-400/10 bg-blue-400/[0.03]">
            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                Analysis Complete
              </p>

              <h3 className="mt-2 text-3xl font-semibold">
                Network influence identified.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                The network has been transformed through
                a sequence of linear algebra operations,
                ending with a normalized influence ranking.
              </p>

              <div className="mt-7 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs text-white/30">
                    Nodes
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {nodes.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs text-white/30">
                    Connections
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {connections.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs text-white/30">
                    Rank
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-blue-300">
                    {matrixRank}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs text-white/30">
                    Top Node
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-blue-300">
                    {rankings[0]?.node ??
                      "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* FOOTER */}
        {/* ------------------------------------------------ */}

        <footer className="border-t border-white/10 py-10">
          <div className="flex flex-col justify-between gap-3 text-xs text-white/20 md:flex-row">
            <p>
              NETRANK — Network Influence &
              Eigenvector Ranking System
            </p>

            <p>
              Linear Algebra • Matrix Theory •
              Eigen Analysis
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}