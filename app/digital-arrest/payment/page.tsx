"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

/**
 * Payment Gateway Page
 * 
 * Realistic payment gateway simulation for Digital Arrest demonstration.
 * Supports UPI, Credit/Debit Card, and Net Banking options.
 */

type PaymentMethod = 'upi' | 'card' | 'netbanking' | null;

const FINE_AMOUNT = 185000;

// Indian banks for net banking
const BANKS = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
    { id: 'bob', name: 'Bank of Baroda' },
    { id: 'canara', name: 'Canara Bank' },
];

// UPI Apps
const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', icon: '💳' },
    { id: 'phonepe', name: 'PhonePe', icon: '📱' },
    { id: 'paytm', name: 'Paytm', icon: '💰' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🏦' },
];

export default function PaymentPage() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);

    // Form states
    const [upiId, setUpiId] = useState('');
    const [selectedUpiApp, setSelectedUpiApp] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    // Prevent back navigation
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        return cleaned;
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        // Simulate payment processing steps
        const steps = [
            'Validating payment details...',
            'Connecting to payment gateway...',
            'Verifying transaction...',
            'Processing payment...',
            'Finalizing...',
        ];

        for (let i = 0; i < steps.length; i++) {
            setProcessingStep(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Redirect to reveal page
        router.push('/reveal');
    };

    const isFormValid = () => {
        switch (selectedMethod) {
            case 'upi':
                return upiId.includes('@') || selectedUpiApp;
            case 'card':
                return cardNumber.replace(/\s/g, '').length === 16 &&
                    cardExpiry.length === 5 &&
                    cardCvv.length === 3 &&
                    cardName.length > 0;
            case 'netbanking':
                return selectedBank !== '';
            default:
                return false;
        }
    };

    const processingMessages = [
        'Validating payment details...',
        'Connecting to secure gateway...',
        'Verifying with bank...',
        'Processing transaction...',
        'Completing payment...',
    ];

    return (
        <div className={styles.container}>
            {/* Processing Overlay */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        className={styles.processingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className={styles.processingContent}>
                            <div className={styles.spinner} />
                            <h3 className={styles.processingTitle}>Processing Payment</h3>
                            <p className={styles.processingText}>
                                {processingMessages[processingStep]}
                            </p>
                            <div className={styles.processingProgress}>
                                <div
                                    className={styles.processingBar}
                                    style={{ width: `${((processingStep + 1) / processingMessages.length) * 100}%` }}
                                />
                            </div>
                            <p className={styles.processingWarning}>
                                Please do not close this window or press back button
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className={styles.main}>
                {/* Header */}
                <motion.header
                    className={styles.header}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className={styles.headerIcon}>🔒</div>
                    <div className={styles.headerText}>
                        <h1 className={styles.headerTitle}>Secure Payment Gateway</h1>
                        <p className={styles.headerSubtitle}>Government of India - Official Payment Portal</p>
                    </div>
                </motion.header>

                {/* Amount Section */}
                <motion.section
                    className={styles.amountSection}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.amountLabel}>Amount to Pay</div>
                    <div className={styles.amountValue}>{formatCurrency(FINE_AMOUNT)}</div>
                    <div className={styles.amountNote}>Income Tax Department Penalty</div>
                </motion.section>

                {/* Payment Methods */}
                <motion.section
                    className={styles.methodsSection}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className={styles.sectionTitle}>Select Payment Method</h2>

                    <div className={styles.methodOptions}>
                        {/* UPI Option */}
                        <button
                            className={`${styles.methodCard} ${selectedMethod === 'upi' ? styles.selected : ''}`}
                            onClick={() => setSelectedMethod('upi')}
                        >
                            <span className={styles.methodIcon}>📲</span>
                            <span className={styles.methodName}>UPI</span>
                            <span className={styles.methodDesc}>GPay, PhonePe, Paytm</span>
                        </button>

                        {/* Card Option */}
                        <button
                            className={`${styles.methodCard} ${selectedMethod === 'card' ? styles.selected : ''}`}
                            onClick={() => setSelectedMethod('card')}
                        >
                            <span className={styles.methodIcon}>💳</span>
                            <span className={styles.methodName}>Credit/Debit Card</span>
                            <span className={styles.methodDesc}>Visa, Mastercard, RuPay</span>
                        </button>

                        {/* Net Banking Option */}
                        <button
                            className={`${styles.methodCard} ${selectedMethod === 'netbanking' ? styles.selected : ''}`}
                            onClick={() => setSelectedMethod('netbanking')}
                        >
                            <span className={styles.methodIcon}>🏦</span>
                            <span className={styles.methodName}>Net Banking</span>
                            <span className={styles.methodDesc}>All Major Banks</span>
                        </button>
                    </div>
                </motion.section>

                {/* Payment Form */}
                <AnimatePresence mode="wait">
                    {selectedMethod && (
                        <motion.section
                            key={selectedMethod}
                            className={styles.formSection}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* UPI Form */}
                            {selectedMethod === 'upi' && (
                                <div className={styles.form}>
                                    <h3 className={styles.formTitle}>Pay using UPI</h3>

                                    <div className={styles.upiApps}>
                                        {UPI_APPS.map(app => (
                                            <button
                                                key={app.id}
                                                className={`${styles.upiApp} ${selectedUpiApp === app.id ? styles.selected : ''}`}
                                                onClick={() => setSelectedUpiApp(app.id)}
                                            >
                                                <span className={styles.upiIcon}>{app.icon}</span>
                                                <span className={styles.upiName}>{app.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className={styles.divider}>
                                        <span>OR</span>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Enter UPI ID</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="yourname@upi"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Card Form */}
                            {selectedMethod === 'card' && (
                                <div className={styles.form}>
                                    <h3 className={styles.formTitle}>Enter Card Details</h3>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Card Number</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            maxLength={19}
                                        />
                                    </div>

                                    <div className={styles.inputRow}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Expiry Date</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="MM/YY"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                maxLength={5}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>CVV</label>
                                            <input
                                                type="password"
                                                className={styles.input}
                                                placeholder="•••"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Cardholder Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Name on card"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Net Banking Form */}
                            {selectedMethod === 'netbanking' && (
                                <div className={styles.form}>
                                    <h3 className={styles.formTitle}>Select Your Bank</h3>

                                    <div className={styles.bankGrid}>
                                        {BANKS.map(bank => (
                                            <button
                                                key={bank.id}
                                                className={`${styles.bankOption} ${selectedBank === bank.id ? styles.selected : ''}`}
                                                onClick={() => setSelectedBank(bank.id)}
                                            >
                                                <span className={styles.bankIcon}>🏦</span>
                                                <span className={styles.bankName}>{bank.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Pay Button */}
                {selectedMethod && (
                    <motion.button
                        className={`${styles.payButton} ${!isFormValid() ? styles.disabled : ''}`}
                        onClick={handlePayment}
                        disabled={!isFormValid() || isProcessing}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={isFormValid() ? { scale: 1.02 } : {}}
                        whileTap={isFormValid() ? { scale: 0.98 } : {}}
                    >
                        <span className={styles.payBtnIcon}>🔐</span>
                        <span className={styles.payBtnText}>
                            MAKE PAYMENT - {formatCurrency(FINE_AMOUNT)}
                        </span>
                    </motion.button>
                )}

                {/* Security Footer */}
                <motion.footer
                    className={styles.footer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className={styles.securityBadges}>
                        <span className={styles.badge}>🔒 256-bit SSL</span>
                        <span className={styles.badge}>✓ PCI DSS Compliant</span>
                        <span className={styles.badge}>🛡️ RBI Approved</span>
                    </div>
                    <p className={styles.footerText}>
                        Your payment information is encrypted and secure.
                    </p>
                </motion.footer>
            </main>
        </div>
    );
}
