import { useEffect, useRef, useState } from 'react';

// Cuenta progresiva de 0 (o desde el valor previo) hasta `value`.
// Uso: <AnimatedNumber value={1250} prefix="$" /> ó format={(n)=>...}
const AnimatedNumber = ({ value = 0, duration = 700, prefix = '', suffix = '', format }) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const rounded = Math.round(display);
  const text = format ? format(rounded) : rounded.toLocaleString('es-AR');

  return <span>{prefix}{text}{suffix}</span>;
};

export default AnimatedNumber;
