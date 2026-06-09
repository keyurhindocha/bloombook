import { usePushSubscription } from '../hooks/usePushSubscription.js';
import styles from './NotificationBanner.module.css';

export default function NotificationBanner() {
  const { status, isIOS, isStandalone, isSupported, subscribe, unsubscribe } = usePushSubscription();

  if (status === 'loading') return null;
  if (!isSupported) return null;

  // iOS: must be installed first
  if (isIOS && !isStandalone) {
    return (
      <div className={styles.banner} data-type="ios">
        <span className={styles.icon}>📲</span>
        <div>
          <strong>Install the app for water reminders</strong>
          <p>Tap <strong>Share →</strong> then <strong>"Add to Home Screen"</strong> to enable push notifications on iOS.</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className={styles.banner} data-type="denied">
        <span className={styles.icon}>🔕</span>
        <div>
          <strong>Notifications blocked</strong>
          <p>Enable them in your browser settings to get watering reminders.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.banner} data-type="denied">
        <span className={styles.icon}>⚠️</span>
        <div>
          <strong>Couldn't enable reminders</strong>
          <p>Something went wrong on the server. Check your connection and try again.</p>
        </div>
        <button className={styles.btn} onClick={subscribe}>Retry</button>
      </div>
    );
  }

  if (status === 'subscribed') {
    return (
      <div className={styles.banner} data-type="on">
        <span className={styles.icon}>🔔</span>
        <div>
          <strong>Watering reminders are on</strong>
          <p>You'll get a morning notification on days plants need water. <button className={styles.link} onClick={unsubscribe}>Turn off</button></p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.banner} data-type="off">
      <span className={styles.icon}>💧</span>
      <div>
        <strong>Get watering reminders</strong>
        <p>Receive a daily notification when your plants need water.</p>
      </div>
      <button className={styles.btn} onClick={subscribe}>Enable</button>
    </div>
  );
}
