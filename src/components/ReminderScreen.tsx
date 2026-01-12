import { motion } from 'framer-motion';
import { Droplets, Settings } from 'lucide-react';

interface ReminderScreenProps {
    onDismiss: () => void;
    onDrink: () => void;
    onSettings: () => void;
}

const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.3 },
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

export default function ReminderScreen({ onDismiss, onDrink, onSettings }: ReminderScreenProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="reminder-container"
        >
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

            {/* Main Card */}
            <motion.div className="reminder-card" variants={itemVariants}>
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

                {/* Action Buttons */}
                <motion.div className="reminder-actions" variants={itemVariants}>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onDismiss}
                        className="btn-secondary"
                    >
                        Later
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onDrink}
                        className="btn-primary"
                    >
                        I Drank Water
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
