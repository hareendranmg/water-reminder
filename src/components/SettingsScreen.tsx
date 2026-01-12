import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { ArrowLeft, Clock, Moon, Sun, Palette, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../theme/theme';

interface SettingsScreenProps {
    onBack: () => void;
}

const PRESETS = [
    { label: '15m', value: 15 * 60 },
    { label: '30m', value: 30 * 60 },
    { label: '45m', value: 45 * 60 },
    { label: '1h', value: 60 * 60 },
    { label: '2h', value: 2 * 60 * 60 },
];

const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
    const { seedColor, setSeedColor, isDark, toggleDarkMode } = useTheme();

    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        invoke('get_settings').then((totalSeconds: any) => {
            if (typeof totalSeconds === 'number') {
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                setHours(h);
                setMinutes(m);
                setSeconds(s);
            }
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load settings", err);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        const finalSeconds = totalSeconds < 10 ? 10 : totalSeconds;

        try {
            await invoke('update_settings', { interval: finalSeconds });
            onBack();
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    const applyPreset = (val: number) => {
        const h = Math.floor(val / 3600);
        const m = Math.floor((val % 3600) / 60);
        const s = val % 60;
        setHours(h);
        setMinutes(m);
        setSeconds(s);
    };

    const adjustValue = (current: number, delta: number, max: number) => {
        const newValue = Math.max(0, Math.min(max, current + delta));
        return newValue;
    };

    const InputField = ({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max: number }) => (
        <motion.div
            className="time-input-group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <div className="time-input-wrapper">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(adjustValue(value, 1, max))}
                    className="time-input-btn time-input-btn-up"
                >
                    <ChevronUp size={16} />
                </motion.button>
                <input
                    type="number"
                    min="0"
                    max={max}
                    value={value}
                    onChange={(e) => {
                        let v = parseInt(e.target.value) || 0;
                        if (v > max) v = max;
                        if (v < 0) v = 0;
                        onChange(v);
                    }}
                    className="time-input"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(adjustValue(value, -1, max))}
                    className="time-input-btn time-input-btn-down"
                >
                    <ChevronDown size={16} />
                </motion.button>
            </div>
            <span className="time-input-label">{label}</span>
        </motion.div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="settings-container"
        >
            {/* Back Button */}
            <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="back-button"
            >
                <ArrowLeft size={18} />
                <span>Back</span>
            </motion.button>

            {/* Header */}
            <motion.div className="settings-header" variants={itemVariants}>
                <motion.div
                    className="settings-icon-wrapper"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Clock className="settings-icon" size={32} />
                </motion.div>
                <h2 className="settings-title">Set Interval</h2>
                <p className="settings-subtitle">Remind me to drink water every...</p>
            </motion.div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="loading-text"
                    >
                        Syncing...
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="settings-content"
                    >
                        {/* Time Inputs */}
                        <motion.div className="time-inputs-container" variants={itemVariants}>
                            <InputField label="Hours" value={hours} onChange={setHours} max={24} />
                            <span className="time-separator">:</span>
                            <InputField label="Mins" value={minutes} onChange={setMinutes} max={59} />
                            <span className="time-separator">:</span>
                            <InputField label="Secs" value={seconds} onChange={setSeconds} max={59} />
                        </motion.div>

                        {/* Appearance Settings */}
                        <motion.div className="appearance-section" variants={itemVariants}>
                            <div className="appearance-header">
                                <Palette className="appearance-icon" size={20} />
                                <h3 className="appearance-title">Appearance</h3>
                            </div>

                            <div className="appearance-item">
                                <span className="appearance-label">Theme Color</span>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <input
                                        type="color"
                                        value={seedColor}
                                        onChange={(e) => setSeedColor(e.target.value)}
                                        className="color-picker"
                                    />
                                </motion.div>
                            </div>

                            <div className="appearance-item">
                                <span className="appearance-label">Dark Mode</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleDarkMode}
                                    className={`dark-mode-toggle ${isDark ? 'dark-mode-on' : ''}`}
                                >
                                    <motion.div
                                        className="dark-mode-thumb"
                                        animate={{ x: isDark ? 28 : 2 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    >
                                        {isDark ? <Moon size={14} /> : <Sun size={14} />}
                                    </motion.div>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Quick Presets */}
                        <motion.div className="presets-container" variants={itemVariants}>
                            {PRESETS.map((p, index) => (
                                <motion.button
                                    key={p.label}
                                    whileHover={{ scale: 1.08, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => applyPreset(p.value)}
                                    className="preset-button"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {p.label}
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Save Button */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            className="save-button"
                        >
                            Save Preferences
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
