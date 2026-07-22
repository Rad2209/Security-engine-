import { Link } from 'react-router-dom';

/**
 * Button
 *
 * Renders as a real <button> by default, or as a React Router <Link>
 * (an <a> tag) when a `to` prop is given. Deliberately never meant to be
 * wrapped INSIDE a <Link> — nesting a <button> inside an <a> is invalid
 * HTML (interactive content inside interactive content), so every "button
 * that navigates somewhere" in this app uses <Button to="..."> instead of
 * <Link><Button></Link>.
 */
function Button({ children, variant = 'primary', className = '', to, ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-sm px-4 py-2 font-body text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-brass-400 text-ink-950 hover:bg-brass-400/90',
    secondary: 'border border-steel-500/60 text-mist-100 hover:border-brass-400/60 hover:text-brass-400',
    ghost: 'text-mist-100/80 hover:text-mist-100',
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;