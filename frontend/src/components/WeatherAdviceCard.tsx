import { useEffect, useRef } from "react";

type Props = {
  advice: string;
};

export default function WeatherAdviceText({ advice }: Props) {
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = paragraphRef.current;
    if (!el || !advice) return;

    el.innerHTML = ""; // clear previous content
    el.style.display = "inline-block";

    let i = 0;
    const speed = 20;

    const timer = setInterval(() => {
      if (i < advice.length) {
        el.append(advice.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [advice]);

  return (
    <p
      ref={paragraphRef}
      className="advice-text whitespace-pre-wrap leading-relaxed"
    />
  );
}
