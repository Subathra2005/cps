import { useEffect, useRef, useCallback } from 'react';

interface TabSwitchDetectionOptions {
  onTabSwitch: () => void;
  isQuizActive: boolean;
  warningEnabled?: boolean;
}

export function useTabSwitchDetection({
  onTabSwitch,
  isQuizActive,
  warningEnabled = true
}: TabSwitchDetectionOptions) {
  const isDetectionActive = useRef(false);
  const hasAlreadyTriggered = useRef(false);
  const warningShown = useRef(false);

  const handleVisibilityChange = useCallback(() => {
    console.log('Visibility change detected:', {
      isDetectionActive: isDetectionActive.current,
      hasAlreadyTriggered: hasAlreadyTriggered.current,
      visibilityState: document.visibilityState
    });
    
    if (!isDetectionActive.current || hasAlreadyTriggered.current) return;

    if (document.visibilityState === 'hidden') {
      console.log('Tab switching detected via visibilitychange');
      
      if (warningEnabled && !warningShown.current) {
        warningShown.current = true;
        alert('⚠️ TAB SWITCHING DETECTED!\n\nYour quiz will be automatically submitted with a score of 0 and you will be locked out for 24 hours.\n\nPlease focus on the quiz tab only.');
      }
      
      hasAlreadyTriggered.current = true;
      onTabSwitch();
    }
  }, [onTabSwitch, warningEnabled]);

  const handleWindowBlur = useCallback(() => {
    console.log('Window blur detected:', {
      isDetectionActive: isDetectionActive.current,
      hasAlreadyTriggered: hasAlreadyTriggered.current
    });
    
    if (!isDetectionActive.current || hasAlreadyTriggered.current) return;

    // Add a small delay to avoid false positives from normal interactions
    setTimeout(() => {
      // Check if the window is still blurred after the delay
      if (!document.hasFocus() && isDetectionActive.current && !hasAlreadyTriggered.current) {
        console.log('Window focus lost detected via blur (delayed check)');
        
        if (warningEnabled && !warningShown.current) {
          warningShown.current = true;
          alert('⚠️ FOCUS LOST DETECTED!\n\nYour quiz will be automatically submitted with a score of 0 and you will be locked out for 24 hours.\n\nPlease keep focus on the quiz.');
        }
        
        hasAlreadyTriggered.current = true;
        onTabSwitch();
      }
    }, 100); // Small delay to avoid false positives
  }, [onTabSwitch, warningEnabled]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!isDetectionActive.current || hasAlreadyTriggered.current) return;

    console.log('Page unload detected');
    
    // Trigger the violation immediately
    hasAlreadyTriggered.current = true;
    onTabSwitch();
    
    // Show browser warning
    e.preventDefault();
    e.returnValue = 'Leaving this page will submit your quiz with score 0. Are you sure?';
    return 'Leaving this page will submit your quiz with score 0. Are you sure?';
  }, [onTabSwitch]);

  const handleContextMenu = useCallback((e: Event) => {
    if (isDetectionActive.current) {
      e.preventDefault();
      console.log('Context menu blocked during quiz');
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isDetectionActive.current) return;

    // Block common shortcuts that might be used to switch tabs or open dev tools
    if (
      (e.ctrlKey || e.metaKey) && (
        e.key === 'Tab' ||       // Ctrl+Tab (tab switching)
        e.key === 't' ||         // Ctrl+T (new tab)
        e.key === 'w' ||         // Ctrl+W (close tab)
        e.key === 'n' ||         // Ctrl+N (new window)
        e.key === 'r' ||         // Ctrl+R (refresh)
        e.key === 'F5' ||        // F5 (refresh)
        e.key === 'F12' ||       // F12 (dev tools)
        (e.shiftKey && e.key === 'I') || // Ctrl+Shift+I (dev tools)
        (e.shiftKey && e.key === 'J') || // Ctrl+Shift+J (console)
        (e.shiftKey && e.key === 'C')    // Ctrl+Shift+C (inspect element)
      ) ||
      e.key === 'F12' ||         // F12 alone
      e.altKey && e.key === 'Tab' // Alt+Tab (app switching)
    ) {
      e.preventDefault();
      
      if (!hasAlreadyTriggered.current) {
        console.log('Blocked keyboard shortcut:', e.key);
        
        // For tab switching shortcuts, trigger violation immediately
        if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
          console.log('Tab switching shortcut detected - triggering violation');
          
          if (warningEnabled && !warningShown.current) {
            warningShown.current = true;
            alert('⚠️ TAB SWITCHING SHORTCUT DETECTED!\n\nYour quiz will be automatically submitted with a score of 0 and you will be locked out for 24 hours.');
          }
          
          hasAlreadyTriggered.current = true;
          onTabSwitch();
        } else if (warningEnabled && !warningShown.current) {
          warningShown.current = true;
          alert('⚠️ SHORTCUT BLOCKED!\n\nKeyboard shortcuts are disabled during the quiz to prevent cheating.\n\nContinued attempts to use shortcuts will result in quiz submission.');
        }
      }
    }
  }, [warningEnabled, onTabSwitch]);

  useEffect(() => {
    if (isQuizActive) {
      console.log('Tab switch detection activated', {
        isQuizActive,
        isDetectionActive: isDetectionActive.current
      });
      isDetectionActive.current = true;
      hasAlreadyTriggered.current = false;
      warningShown.current = false;

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        console.log('Tab switch detection deactivated');
        isDetectionActive.current = false;
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      console.log('Tab switch detection not activated', {
        isQuizActive,
        isDetectionActive: isDetectionActive.current
      });
      isDetectionActive.current = false;
    }
  }, [isQuizActive, handleVisibilityChange, handleWindowBlur, handleBeforeUnload, handleContextMenu, handleKeyDown]);

  return {
    isDetectionActive: isDetectionActive.current,
    reset: () => {
      hasAlreadyTriggered.current = false;
      warningShown.current = false;
    }
  };
}
