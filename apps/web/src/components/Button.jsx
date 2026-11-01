const VARIANTS = {
  primary: 'button button-primary',
  ghost: 'button button-ghost',
};

export default function Button({ variant = 'primary', type = 'button', className = '', children, ...props }) {
  const classes = [VARIANTS[variant] ?? VARIANTS.primary, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
