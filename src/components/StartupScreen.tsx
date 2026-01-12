import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Settings, Sparkles, X } from 'lucide-react';

export default function StartupScreen({ onComplete, onSettings, onClose }: { onComplete: () => void; onSettings: () => void; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.15,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: -20,
            transition: { duration: 0.4 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="startup-container"
        >
            {/* Close Button */}
            <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="startup-close-button"
                title="Close"
            >
                <X size={20} />
            </motion.button>

            {/* Settings Button */}
            <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettings}
                className="startup-settings-button"
                title="Settings"
            >
                <Settings size={20} />
            </motion.button>

            {/* Main Card */}
            <motion.div className="startup-card" variants={itemVariants}>
                {/* Animated Icon */}
                <motion.div
                    className="startup-icon-container"
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="startup-icon-wrapper">
                        <Droplets className="startup-icon" size={100} />
                        <motion.div
                            className="startup-ripple"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 0, 0.4],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                        <motion.div
                            className="startup-ripple startup-ripple-delayed"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0, 0.3],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: 0.5,
                            }}
                        />
                    </div>
                </motion.div>

                {/* Greeting */}
                <motion.h1 className="startup-heading" variants={itemVariants}>
                    Hello, Hareendran!
                </motion.h1>

                {/* Message */}
                <motion.div className="startup-message" variants={itemVariants}>
                    <motion.p
                        className="startup-message-main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Stay hydrated. Stay focused.
                    </motion.p>
                    <motion.p
                        className="startup-message-sub"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Have a wonderful day ahead.
                    </motion.p>
                </motion.div>

                {/* Loading Indicator */}
                <motion.div
                    className="startup-loader"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                />
            </motion.div>
        </motion.div>
    );
}
