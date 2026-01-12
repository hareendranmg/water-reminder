import { motion } from 'framer-motion';
import { GlassWater } from 'lucide-react';

interface ReminderScreenProps {
    onDismiss: () => void;
    onDrink: () => void;
}

export default function ReminderScreen({ onDismiss, onDrink }: ReminderScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-panel flex flex-col items-center gap-6"
        >
            <motion.div
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <GlassWater className="icon-large text-blue-100" />
            </motion.div>

            <div>
                <h1 style={{ fontSize: '2.5em' }}>Time to Hydrate!</h1>
                <p className="text-lg opacity-90">
                    It's been an hour. Take a sip of water.
                </p>
            </div>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={onDismiss}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    Later
                </button>
                <button
                    onClick={onDrink}
                    style={{
                        background: '#ffffff',
                        color: '#3a7bd5',
                        fontWeight: 'bold'
                    }}
                >
                    I Drank Water
                </button>
            </div>
        </motion.div>
    );
}
