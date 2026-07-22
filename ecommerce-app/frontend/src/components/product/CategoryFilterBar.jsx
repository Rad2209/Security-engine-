function CategoryFilterBar({ categories, activeSlug, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
          !activeSlug
            ? 'border-brass-400 text-brass-400'
            : 'border-steel-500/60 text-mist-100/70 hover:border-brass-400/50'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
            activeSlug === cat.slug
              ? 'border-brass-400 text-brass-400'
              : 'border-steel-500/60 text-mist-100/70 hover:border-brass-400/50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilterBar;