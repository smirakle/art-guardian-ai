export const MatrixRain = () => {
  const columns = 40;
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {[...Array(columns)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 text-primary text-xs font-mono leading-tight whitespace-nowrap animate-matrix-fall"
          style={{
            left: `${(i / columns) * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          {Array(50).fill(0).map((_, j) => (
            <div key={j}>
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
