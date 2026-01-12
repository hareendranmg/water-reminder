import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Settings, X, Clock } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface ReminderScreenProps {
    onDismiss: () => void;
    onDrink: () => void;
    onSettings: () => void;
    onClose: () => void;
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

const containerVariants: any = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.3 },
    },
};

const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function ReminderScreen({ onDismiss, onDrink, onSettings, onClose }: ReminderScreenProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [reminderInterval, setReminderInterval] = useState<number>(3600);

    const updateCountdown = async () => {
        try {
            const remaining = await invoke<number>('get_next_reminder_time');
            setTimeRemaining(remaining);
        } catch (error) {
            console.error('Failed to get next reminder time:', error);
        }
    };

    useEffect(() => {
        let countdownTimer: ReturnType<typeof setTimeout>;
        let syncTimer: ReturnType<typeof setTimeout>;

        // Get the interval and initial countdown
        const initialize = async () => {
            try {
                const intervalSecs = await invoke<number>('get_settings');
                setReminderInterval(intervalSecs);

                // Get initial countdown from backend
                const remaining = await invoke<number>('get_next_reminder_time');
                setTimeRemaining(remaining);

                // Start decrementing countdown locally every second
                countdownTimer = setInterval(() => {
                    setTimeRemaining((prev) => {
                        if (prev > 0) {
                            return prev - 1;
                        }
                        // If it reaches 0, refresh from backend
                        updateCountdown();
                        return 0;
                    });
                }, 1000);

                // Refresh from backend every 10 seconds to stay in sync
                syncTimer = setInterval(() => {
                    updateCountdown();
                }, 10000);
            } catch (error) {
                console.error('Failed to initialize countdown:', error);
            }
        };

        initialize();

        return () => {
            if (countdownTimer) clearInterval(countdownTimer);
            if (syncTimer) clearInterval(syncTimer);
        };
    }, []);

    // Update countdown when actions are taken
    const handleDismissWithUpdate = async () => {
        await onDismiss();
        // Refresh countdown after backend updates
        setTimeout(updateCountdown, 200);
    };

    const handleDrinkWithUpdate = async () => {
        await onDrink();
        // Refresh countdown after backend updates
        setTimeout(updateCountdown, 200);
    };

    const nextReminderDate = new Date(Date.now() + timeRemaining * 1000);
    const progressPercentage = reminderInterval > 0 ? Math.min(100, ((reminderInterval - timeRemaining) / reminderInterval) * 100) : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="reminder-container"
        >
            {/* Close Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="close-button"
                title="Close"
                variants={itemVariants}
            >
                <X size={20} />
            </motion.button>

            {/* Settings Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettings}
                className="settings-button"
                title="Settings"
                variants={itemVariants}
            >
                <Settings size={20} />
            </motion.button>

            {/* Main Content */}
            <motion.div className="reminder-content" variants={itemVariants}>
                {/* Animated Water Icon */}
                <motion.div
                    className="water-icon-container"
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="water-icon-wrapper">
                        <Droplets className="water-icon" size={80} />
                        <motion.div
                            className="water-ripple"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.6, 0, 0.6],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                    </div>
                </motion.div>

                {/* Heading */}
                <motion.h1 className="reminder-heading" variants={itemVariants}>
                    Time to Hydrate!
                </motion.h1>

                {/* Message */}
                <motion.p className="reminder-message" variants={itemVariants}>
                    It's been an hour. Take a sip of water.
                </motion.p>

                {/* Countdown Timer */}
                <motion.div className="countdown-section" variants={itemVariants}>
                    <div className="countdown-container">
                        <Clock className="countdown-icon" size={18} />
                        <div className="countdown-content">
                            <div className="countdown-label">Next reminder in</div>
                            <motion.div
                                key={timeRemaining}
                                initial={{ scale: 1.2, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="countdown-time"
                            >
                                {formatTime(timeRemaining)}
                            </motion.div>
                            <div className="countdown-date">
                                {nextReminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <motion.div
                        className="countdown-progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </motion.div>

                {/* Action Buttons */}
                <motion.div className="reminder-actions" variants={itemVariants}>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDismissWithUpdate}
                        className="btn-secondary"
                    >
                        Later
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDrinkWithUpdate}
                        className="btn-primary"
                    >
                        I Drank Water
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
