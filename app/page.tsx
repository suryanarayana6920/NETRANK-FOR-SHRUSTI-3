import Link from "next/link";
const features = [
  {
    number: "01",
    title: "Network Builder",
    description: "Create and visualize nodes and connections interactively.",
  },
  {
    number: "02",
    title: "Adjacency Matrix",
    description: "Convert the network into its mathematical matrix representation.",
  },
  {
    number: "03",
    title: "Eigen Analysis",
    description: "Calculate eigenvalues and eigenvectors to identify influence.",
  },
  {
    number: "04",
    title: "Influence Ranking",
    description: "Normalize the dominant eigenvector and rank every node.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-bold">
              N
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                NETRANK
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                Network Intelligence
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <span className="text-white">Overview</span>
            <span>Methodology</span>
            <span>About</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Linear Algebra × Network Science
            </div>

            <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Discover the
              <br />
              <span className="text-white/40">most influential</span>
              <br />
              nodes in a network.
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/50">
              NETRANK transforms a network into mathematical representations
              and uses eigenvector analysis to measure the relative influence
              of every node.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
            <Link
  href="/network"
  className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
>
  Create Network →
</Link>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.07]">
                Explore Methodology
              </button>
            </div>
          </div>

          {/* Network visualization */}
          <div className="relative mt-20 h-[300px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            <div className="absolute inset-0 opacity-30">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-[500px] max-w-[90%]">
                {/* Connections */}
                <div className="absolute left-[18%] top-[42%] h-px w-[28%] rotate-[-15deg] bg-white/20" />
                <div className="absolute left-[42%] top-[44%] h-px w-[27%] rotate-[18deg] bg-white/20" />
                <div className="absolute left-[26%] top-[52%] h-px w-[35%] rotate-[35deg] bg-white/20" />
                <div className="absolute left-[55%] top-[50%] h-px w-[25%] rotate-[-35deg] bg-white/20" />
                <div className="absolute left-[34%] top-[38%] h-px w-[30%] rotate-[80deg] bg-white/20" />

                {/* Nodes */}
                <div className="absolute left-[10%] top-[35%] flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#11151d] text-xs">
                  A
                </div>

                <div className="absolute left-[38%] top-[25%] flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/50 bg-blue-500/10 text-xs text-blue-300">
                  B
                </div>

                <div className="absolute left-[62%] top-[43%] flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/70 bg-blue-500/20 text-sm font-semibold text-blue-200 shadow-[0_0_50px_rgba(59,130,246,0.25)]">
                  C
                </div>

                <div className="absolute left-[82%] top-[25%] flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#11151d] text-xs">
                  D
                </div>

                <div className="absolute left-[35%] top-[68%] flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#11151d] text-xs">
                  E
                </div>
              </div>
            </div>

            <div className="absolute bottom-5 left-6 text-xs text-white/30">
              Sample influence network
            </div>

            <div className="absolute bottom-5 right-6 flex items-center gap-2 text-xs text-blue-300/70">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              High influence
            </div>
          </div>
        </div>
      </section>

      {/* Mathematical pipeline */}
      <section className="border-t border-white/10 bg-[#0a0d12]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
              Computational Pipeline
            </p>

            <h3 className="mt-3 text-3xl font-semibold tracking-tight">
              From network to ranking.
            </h3>

            <p className="mt-3 max-w-2xl text-white/40">
              Each stage transforms the output of the previous stage into the
              mathematical input for the next.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="bg-[#0a0d12] p-7 transition hover:bg-white/[0.03]"
              >
                <span className="text-xs font-mono text-white/30">
                  {feature.number}
                </span>

                <h4 className="mt-8 text-lg font-semibold">
                  {feature.title}
                </h4>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mathematics */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">
                Mathematical Core
              </p>

              <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                Linear algebra
                <br />
                drives the ranking.
              </h3>

              <p className="mt-6 max-w-lg leading-7 text-white/40">
                NETRANK represents relationships between nodes using matrices,
                analyses their structure, and uses eigenvector information to
                determine relative node influence.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <div className="font-mono text-sm leading-10 text-white/50">
                <div>
                  <span className="text-blue-400">A</span> = Adjacency Matrix
                </div>
                <div>
                  <span className="text-blue-400">rank(A)</span> = Matrix Rank
                </div>
                <div>
                  <span className="text-blue-400">Av</span> = λv
                </div>
                <div>
                  <span className="text-blue-400">v</span> = Eigenvector
                </div>
                <div>
                  <span className="text-blue-400">λ</span> = Eigenvalue
                </div>
                <div>
                  <span className="text-blue-400">v̂</span> = Normalized Influence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
          <span>NETRANK © 2026</span>
          <span>Network Influence & Eigenvector Ranking System</span>
        </div>
      </footer>
    </main>
  );
}