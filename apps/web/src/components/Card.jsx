export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  const classes = ['card', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
