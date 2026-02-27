import { getNetworkStatus } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(getNetworkStatus());
  const [hasShownOfflineToast, setHasShownOfflineToast] = useState<boolean>(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setHasShownOfflineToast(false);
      toast.success("You're back online!", {
        duration: 2000,
      });
    }

    function handleOffline() {
      setIsOnline(false);
      if (!hasShownOfflineToast) {
        toast.error("You are offline, some content won't be visible", {
          duration: 2000,
        });
        setHasShownOfflineToast(true);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!isOnline && !hasShownOfflineToast) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, hasShownOfflineToast]);

  return isOnline;
}

export default useNetworkStatus;
