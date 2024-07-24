export default function useScrollIntoView(element: HTMLElement | string) {
  const scrollTo = () => {
    const el = typeof element === "string" ? document.querySelector(element) : element;
    el?.scrollIntoView({ behavior: "smooth" });
  };
  return scrollTo;
}