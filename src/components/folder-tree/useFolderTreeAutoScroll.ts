import { useCallback, useEffect, useRef, type WheelEvent } from "react";

export function useFolderTreeAutoScroll(isDragging: boolean) {
  const treeRef = useRef<HTMLElement>(null);
  const pointerYRef = useRef<number | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const tickAutoScroll = useCallback(() => {
    animationFrameRef.current = undefined;

    const treeElement = treeRef.current;
    const pointerY = pointerYRef.current;

    if (!treeElement || typeof pointerY !== "number") {
      return;
    }

    const bounds = treeElement.getBoundingClientRect();
    const edgeSize = 56;
    const maxSpeed = 16;
    let scrollDelta = 0;

    if (pointerY < bounds.top + edgeSize) {
      const intensity = 1 - Math.max(0, pointerY - bounds.top) / edgeSize;
      scrollDelta = -Math.ceil(intensity * maxSpeed);
    } else if (pointerY > bounds.bottom - edgeSize) {
      const intensity = 1 - Math.max(0, bounds.bottom - pointerY) / edgeSize;
      scrollDelta = Math.ceil(intensity * maxSpeed);
    }

    if (scrollDelta !== 0) {
      treeElement.scrollTop += scrollDelta;
      animationFrameRef.current = window.requestAnimationFrame(tickAutoScroll);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    pointerYRef.current = undefined;

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  const updateAutoScroll = useCallback(
    (clientY: number) => {
      if (!isDragging) {
        stopAutoScroll();
        return;
      }

      pointerYRef.current = clientY;

      if (!animationFrameRef.current) {
        animationFrameRef.current = window.requestAnimationFrame(tickAutoScroll);
      }
    },
    [isDragging, stopAutoScroll, tickAutoScroll]
  );

  const handleWheelDuringDrag = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (!isDragging) {
        return;
      }

      const treeElement = treeRef.current;
      if (!treeElement || event.deltaY === 0) {
        return;
      }

      event.preventDefault();
      treeElement.scrollTop += event.deltaY;
      updateAutoScroll(event.clientY);
    },
    [isDragging, updateAutoScroll]
  );

  useEffect(() => {
    if (!isDragging) {
      stopAutoScroll();
    }

    return stopAutoScroll;
  }, [isDragging, stopAutoScroll]);

  return {
    treeRef,
    updateAutoScroll,
    stopAutoScroll,
    handleWheelDuringDrag
  };
}
