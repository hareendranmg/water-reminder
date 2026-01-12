import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AnimatePresence } from "framer-motion";
import StartupScreen from "./components/StartupScreen";
import ReminderScreen from "./components/ReminderScreen";
import "./App.css";

// We'll define a custom event or just use window visibility for now.
// Ideally backend sends an event "show-reminder".

function App() {
  const [mode, setMode] = useState<"startup" | "reminder" | "hidden">("startup");

  const handleStartupComplete = async () => {
    // Hide the window after startup
    setMode("hidden");
    await invoke("hide_window");

    // For demo purposes, we might want to simulate the reminder triggering
    // In production, Rust backend triggers this.
    // However, since we are doing a hybrid approach:
    // We can also just keep the app running and show the reminder.
    // But better to let Rust handle the interval to ensure it pops up.
  };

  const handleDismiss = async () => {
    await invoke("hide_window");
    // We keep mode as reminder or switch to hidden, waiting for next event.
    // Visually we want to probably exit first.
    setMode("hidden");
  };

  const handleDrink = async () => {
    // Log drinking if we wanted to
    await invoke("hide_window");
    setMode("hidden");
  };

  // Listen for backend event "show_reminder"
  // Listen for backend event "show_reminder"
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      const { listen } = await import("@tauri-apps/api/event");
      unlisten = await listen("show-reminder", () => {
        setMode("reminder");
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // For the purpose of this task (visuals first), let's cycle
  // If we are in "hidden" mode, the view is empty, but actually the window is hidden by Tauri.
  // When window is shown again by Rust, we should be in "reminder" mode.

  // We can force this by updating state based on window focus/visibility?
  // Let's rely on a global window function exposed or just simple state for now.

  // To test the flow: Startup -> 3s -> Hide.
  // Then we need a mechanism to show it again.

  return (
    <div className="container" style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <AnimatePresence mode="wait">
        {mode === "startup" && (
          <StartupScreen key="startup" onComplete={handleStartupComplete} />
        )}
        {mode === "reminder" && (
          <ReminderScreen key="reminder" onDismiss={handleDismiss} onDrink={handleDrink} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
