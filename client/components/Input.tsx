import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    labelClassName?: string;
    containerClassName?: string;
    inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className,
    labelClassName = "text-cr-muted",
    containerClassName = "bg-cr-card border-gray-800",
    inputClassName = "text-cr-text placeholder-cr-muted",
    ...props
}) => {
    return (
        <View className={`space-y-2 ${className}`}>
            <Text className={`font-medium ml-1 ${labelClassName}`}>{label}</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3 focus:border-blue-500 transition-colors ${containerClassName}`}>
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    className={`flex-1 text-lg ${inputClassName}`}
                    placeholderTextColor={props.placeholderTextColor || "#9CA3AF"}
                    {...props}
                />
            </View>
            {error && <Text className="text-red-500 text-sm ml-1">{error}</Text>}
        </View>
    );
};
