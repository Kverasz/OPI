import senacImg from '../../imports/image-5.png';

export function SenacLogo({ className = "h-10", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src={senacImg}
      alt="SENAC"
      className={className}
      style={style}
    />
  );
}
