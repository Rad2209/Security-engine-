/**
 * App.jsx — Phase 1 placeholder.
 *
 * This just proves the Vite + React + Tailwind pipeline (fonts, colors,
 * build) works end to end. Real routing, context providers, and layout
 * (Header/Footer) get wired in here during Phase 4.
 */
function App() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist-100">
          ESCAPEMENT
        </h1>
        <p className="mt-3 font-mono text-sm text-steel-500">
          Phase 1 scaffold — routing wired in Phase 4
        </p>
        <p className="mt-6 font-mono text-xs text-brass-400">42mm · 100m · 42h</p>
      </div>
    </div>
  );
}

export default App;