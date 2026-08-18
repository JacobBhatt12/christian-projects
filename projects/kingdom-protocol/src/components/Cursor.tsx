interface CursorProps {
  className?: string;
}

export function Cursor({ className = "" }: CursorProps) {
  return <span aria-hidden="true" className={`kp-cursor ${className}`} />;
}
