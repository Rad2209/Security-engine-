function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-body text-sm text-mist-100/80">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-sm border border-steel-500/60 bg-steel-800 px-3 py-2 font-body text-sm text-mist-100 placeholder:text-mist-100/30 focus:border-brass-400 ${className}`}
        {...props}
      />
      {error && <p className="font-mono text-xs text-tick-red">{error}</p>}
    </div>
  );
}

export default Input;