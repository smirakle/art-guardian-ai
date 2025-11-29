interface ShieldEffectProps {
  size: number;
  color: string;
  delay: number;
}

export const ShieldEffect = ({ size, color, delay }: ShieldEffectProps) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center animate-shield-appear"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div 
        className={`rounded-lg border-4 bg-gradient-to-br ${color} opacity-20 animate-pulse-shield`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          borderColor: 'currentColor'
        }}
      />
    </div>
  );
};
