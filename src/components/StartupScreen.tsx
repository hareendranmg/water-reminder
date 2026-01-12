import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function StartupScreen({ onComplete }: { onComplete: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-panel flex flex-col items-center justify-center gap-6 max-w-md"
            onAnimationComplete={() => {
                // Automatically proceed after a delay
                setTimeout(onComplete, 3000);
            }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <Sparkles className="icon-large" />
            </motion.div>

            <h1>Hello, Hareendran!</h1>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/90"
            >
                Stay hydrated. Stay focused.
                <br />
                <span className="text-sm opacity-70 mt-2 block">
                    Have a wonderful day ahead.
                </span>
            </motion.p>
        </motion.div>
    );
}
