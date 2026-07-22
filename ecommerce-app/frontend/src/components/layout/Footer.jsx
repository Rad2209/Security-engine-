function Footer() {
  return (
    <footer className="border-t border-steel-500/40 bg-ink-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-display text-base tracking-wide text-mist-100">ESCAPEMENT</p>
        <p className="mt-2 max-w-md font-body text-sm text-mist-100/60">
          Mechanical watches and the accessories that go with them. Every listing ships with its
          full spec sheet — no marketing gloss.
        </p>
        <p className="mt-6 font-mono text-xs text-steel-500">
          © {new Date().getFullYear()} Escapement. Demo storefront for a Security Engine research
          project.
        </p>
      </div>
    </footer>
  );
}

export default Footer;