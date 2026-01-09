import React from "react";
import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: "primary" | "secondary" | "outline";
    loading?: boolean;
    disabled?: boolean;
    className?: string; // Allow extra styles
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
}) => {
    const baseStyle = "py-4 rounded-xl items-center justify-center active:opacity-80";
    const variantStyles = {
        primary: "bg-cr-gold shadow-lg shadow-yellow-900/20",
        secondary: "bg-gray-800",
        outline: "border-2 border-cr-gold bg-transparent",
    };
    const textStyles = {
        primary: "text-cr-black font-bold text-lg",
        secondary: "text-white font-bold text-lg",
        outline: "text-cr-gold font-bold text-lg",
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            className={`${baseStyle} ${variantStyles[variant]} ${className} ${(disabled || loading) ? "opacity-50" : ""}`}
        >
            {loading ? (
                <ActivityIndicator color={variant === "outline" ? "#D4AF37" : "black"} />
            ) : (
                <Text className={textStyles[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};
