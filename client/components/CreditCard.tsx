import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Sparkline } from "./Sparkline";
import { Ionicons } from "@expo/vector-icons";

interface CreditCardProps {
    issuer: string;
    endingDigits: string;
    balance: number;
    limit: number;
    dueDate: string; // Expected format "Day X" or similar for now
    dueDay?: number; // Raw day number for better calc
}

export const CreditCard: React.FC<CreditCardProps> = ({
    issuer,
    endingDigits,
    balance,
    limit,
    dueDate,
    dueDay
}) => {
    // Mock Sparkline Data based on balance trends
    const sparkData = [200, 450, 300, 600, 550, balance];
    const utilization = ((balance / limit) * 100).toFixed(1);

    // Snapshot Logic
    // We'll assume the snapshot is roughly 3 days after the due date for this logic, 
    // or we can just derive it from the "dueDay". 
    // SPEC: "Snapshot in X days" – red (<7), orange (8–14), green (>14)

    const today = new Date().getDate();
    const dDay = dueDay || 28; // fallback

    // Simple logic: snapshot day is often statement close date. 
    // Let's assume input 'dueDay' is actually the statement close day for this "Snapshot" feature logic?
    // Or let's just calc approximate days until next 'dDay'.

    let daysUntilSnapshot = dDay - today;
    if (daysUntilSnapshot < 0) daysUntilSnapshot += 30;

    let snapshotColor = "text-green-500";
    if (daysUntilSnapshot < 7) snapshotColor = "text-red-500";
    else if (daysUntilSnapshot <= 14) snapshotColor = "text-orange-400";

    const getIssuerIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("chase")) return "shield-checkmark"; // mimic logo
        if (n.includes("amex")) return "card";
        if (n.includes("citi")) return "business";
        return "wallet";
    };

    return (
        <View className="bg-cr-card rounded-xl p-4 mb-3 border border-gray-800 w-full">
            <View className="flex-row items-center border-b border-gray-800 pb-4 mb-4">
                {/* Left: Issuer Logo */}
                <View className="w-12 h-12 bg-gray-900 rounded-full items-center justify-center mr-4 border border-gray-700">
                    <Ionicons name={getIssuerIcon(issuer) as any} size={24} color="#D4AF37" />
                </View>

                {/* Middle: Balance & Snapshot */}
                <View className="flex-1">
                    <Text className="text-cr-text font-bold text-2xl tracking-tighter">
                        ${balance.toFixed(2)}
                    </Text>
                    <Text className={`text-xs font-bold ${snapshotColor}`}>
                        Snapshot in {daysUntilSnapshot} days
                    </Text>
                </View>

                {/* Right: Info Icon */}
                <TouchableOpacity
                    onPress={() => Alert.alert("Tip", "Pay 7 days early to keep utilization under 10%")}
                    className="p-2"
                >
                    <Ionicons name="information-circle-outline" size={20} color="#A0A0A0" />
                </TouchableOpacity>
            </View>

            {/* Gray line info */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-cr-muted text-xs">Due Feb 3 • {issuer} •••• {endingDigits}</Text>
                <Text className="text-cr-muted text-xs">{utilization}% Util</Text>
            </View>

            {/* Bottom: Sparkline */}
            <View className="h-8 w-full justify-end flex-row items-center space-x-2">
                <Text className="text-cr-muted text-[10px]">3mo Trend</Text>
                <Sparkline
                    data={sparkData}
                    width={100}
                    height={30}
                    color={Number(utilization) > 30 ? "#EF4444" : "#10B981"}
                />
            </View>
        </View>
    );
};
