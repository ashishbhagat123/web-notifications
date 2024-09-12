"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";
import styles from "./page.module.css";

function urlBase64ToUint8Array(base64String) {
  console.log(base64String, "here...");
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+") // No need to escape the hyphen
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    main();
    
  }, ["PushManager" in window, "serviceWorker" in navigator]);

  const main = async () => {
    check();
    Notification.requestPermission().then(async function () {
      await registerServiceWorker();
      setIsSupported(true);
    });
  };

  const check = () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("No Service Worker support!");
    }
    if (!("PushManager" in window)) {
      throw new Error("No Push API Support!");
    }
  };

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      console.log(registration, "here...");
      const sub = await registration?.pushManager?.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.log(error);
    }
  }

  async function subscribeToPush() {
    console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      ),
    });

    // Serialize the PushSubscription object
    const subscriptionData = sub.toJSON();
    setSubscription(sub);

    // Send the serialized object to the server
    await subscribeUser(subscriptionData);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (!subscription) {
      console.error("No subscription available.");
      return;
    }

    console.log("HERE.....1");

    try {
      await sendNotification(message);
      setMessage("");
    } catch (error) {
      console.log("THATS");
      console.error("Failed to send notification:", error);
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className={styles.notifications}>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button className={styles.btn} onClick={unsubscribeFromPush}>
            Unsubscribe
          </button>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className={styles.btn} onClick={sendTestNotification}>
            Send Test
          </button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button className={styles.button} onClick={subscribeToPush}>
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setDeferredPrompt(e); // Store the event for later
      setIsInstallPromptVisible(true); // Show custom install prompt UI
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Show the browser install prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null); // Clear the deferred prompt
        setIsInstallPromptVisible(false); // Hide the install button
      });
    }
  };

  return (
    <div className={styles.installApp}>
      {isInstallPromptVisible && (
        <button className={styles.button} onClick={handleInstallClick}>
          Install App
        </button>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <div className={styles.container}>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  );
}
