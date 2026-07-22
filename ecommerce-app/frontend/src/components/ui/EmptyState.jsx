function EmptyState({ title, description, action }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-lg text-mist-100">{title}</p>
      {description && <p className="mt-2 font-body text-sm text-mist-100/60">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;