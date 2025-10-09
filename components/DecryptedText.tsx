import { useEffect, useState, useRef, useMemo, useCallback, memo } from 'react';

function isWhitespaceCharacter(char: string): boolean {
  return char === ' ' || char === '\n' || char === '\r' || char === '\t';
}

interface DecryptedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover' | 'both';
  triggerOnce?: boolean;
  priority?: boolean;
}

let globalAnimationCounter = 0;
let resetTimeoutId: number | undefined;

function scheduleCounterReset() {
  if (typeof window === 'undefined') return;

  if (resetTimeoutId !== undefined) {
    window.clearTimeout(resetTimeoutId);
  }

  resetTimeoutId = window.setTimeout(() => {
    globalAnimationCounter = 0;
    resetTimeoutId = undefined;
  }, 5000);
}

function DecryptedText({
  text,
  speed = 25,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  triggerOnce,
  priority = false,
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const currentIterationRef = useRef<number>(0);
  const shouldTriggerOnce = triggerOnce ?? animateOn === 'view';

  // Memoize available characters
  const availableChars = useMemo(() =>
    useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter(char => !isWhitespaceCharacter(char))
      : characters.split(''),
    [useOriginalCharsOnly, text, characters]
  );

  // Memoize reveal batch size
  const revealBatch = useMemo(() =>
    sequential ? Math.max(1, Math.ceil(text.length / (priority ? 20 : 30))) : 1,
    [sequential, text.length, priority]
  );

  // Memoize getNextIndex function
  const getNextIndex = useCallback((revealedSet: Set<number>): number => {
    const textLength = text.length;
    switch (revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }
        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  }, [text.length, revealDirection]);

  // Memoize shuffleText function
  const shuffleText = useCallback((originalText: string, currentRevealed: Set<number>): string => {
    if (useOriginalCharsOnly) {
      const positions = originalText.split('').map((char, i) => ({
        char,
        isWhitespace: isWhitespaceCharacter(char),
        index: i,
        isRevealed: currentRevealed.has(i)
      }));

      const nonWhitespaceChars = positions.filter(p => !p.isWhitespace && !p.isRevealed).map(p => p.char);

      for (let i = nonWhitespaceChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonWhitespaceChars[i], nonWhitespaceChars[j]] = [nonWhitespaceChars[j], nonWhitespaceChars[i]];
      }

      let charIndex = 0;
      return positions
        .map(p => {
          if (p.isWhitespace) return p.char;
          if (p.isRevealed) return originalText[p.index];
          return nonWhitespaceChars[charIndex++];
        })
        .join('');
    } else {
      return originalText
        .split('')
        .map((char, i) => {
          if (isWhitespaceCharacter(char)) return char;
          if (currentRevealed.has(i)) return originalText[i];
          if (availableChars.length === 0) return originalText[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join('');
    }
  }, [useOriginalCharsOnly, availableChars, text]);

  // Use requestAnimationFrame instead of setInterval
  useEffect(() => {
    if (!isHovering) {
      setDisplayText(text);
      if (!shouldTriggerOnce || !hasAnimatedRef.current) {
        setRevealedIndices(new Set());
      }
      setIsScrambling(false);
      currentIterationRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      return;
    }

    setIsScrambling(true);
    lastUpdateRef.current = performance.now();
    currentIterationRef.current = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastUpdateRef.current;

      if (elapsed >= speed) {
        lastUpdateRef.current = currentTime;

        setRevealedIndices(prevRevealed => {
          if (sequential) {
            if (prevRevealed.size < text.length) {
              const newRevealed = new Set(prevRevealed);
              let additions = 0;
              while (additions < revealBatch && newRevealed.size < text.length) {
                const nextIndex = getNextIndex(newRevealed);
                if (nextIndex === undefined || newRevealed.has(nextIndex)) break;
                newRevealed.add(nextIndex);
                additions++;
              }
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            } else {
              setIsScrambling(false);
              if (shouldTriggerOnce) {
                setIsHovering(false);
              }
              return prevRevealed;
            }
          } else {
            setDisplayText(shuffleText(text, prevRevealed));
            currentIterationRef.current++;
            if (currentIterationRef.current >= maxIterations) {
              setIsScrambling(false);
              setDisplayText(text);
              if (shouldTriggerOnce) {
                setIsHovering(false);
              }
            }
            return prevRevealed;
          }
        });
      }

      if (isHovering && (sequential && revealedIndices.size < text.length || !sequential && currentIterationRef.current < maxIterations)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovering, text, speed, maxIterations, sequential, shouldTriggerOnce, getNextIndex, shuffleText, revealBatch, revealedIndices.size]);

  useEffect(() => {
    if (animateOn !== 'view' && animateOn !== 'both') return;

    if (shouldTriggerOnce && hasAnimatedRef.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && (!shouldTriggerOnce || !hasAnimatedRef.current)) {
          const delay = priority ? globalAnimationCounter * 15 : 50;

          if (priority) {
            globalAnimationCounter++;
            scheduleCounterReset();
          }

          setTimeout(() => {
            setIsHovering(true);
            hasAnimatedRef.current = true;
          }, delay);

          if (shouldTriggerOnce) {
            observer.disconnect();
          }
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [animateOn, shouldTriggerOnce, priority]);

  // Memoize hover props
  const hoverProps = useMemo(() =>
    animateOn === 'hover' || animateOn === 'both'
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false)
        }
      : {},
    [animateOn]
  );

  // Memoize character spans
  const characterSpans = useMemo(() =>
    displayText.split('').map((char, index) => {
      const isRevealedOrDone = revealedIndices.has(index) || !isScrambling || !isHovering;
      return (
        <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
          {char}
        </span>
      );
    }),
    [displayText, revealedIndices, isScrambling, isHovering, className, encryptedClassName]
  );

  return (
    <span
      ref={containerRef}
      className={`whitespace-pre-wrap ${parentClassName}`}
      {...hoverProps}
      {...props}
    >
      <span className="sr-only">{displayText}</span>

      <span aria-hidden="true">
        {characterSpans}
      </span>
    </span>
  );
}

// Export memoized component
export default memo(DecryptedText);
