import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Offers() {
    return (
        <SafeAreaView className="flex-1 bg-cr-black">
            <View className="px-6 pt-4 pb-2">
                <Text className="text-2xl font-bold text-cr-text">Exclusive Offers</Text>
            </View>

            <ScrollView className="flex-1 px-4 mt-2" showsVerticalScrollIndicator={false}>
                {/* Promo Card 1 */}
                <TouchableOpacity className="bg-cr-card rounded-xl overflow-hidden mb-6 border border-gray-800">
                    <View className="h-32 bg-gray-900 justify-center items-center">
                        <Text className="text-cr-gold font-bold text-xl tracking-widest">AMEX GOLD</Text>
                    </View>
                    <View className="p-4">
                        <Text className="text-cr-text font-bold text-lg mb-1">90,000 Bonus Points</Text>
                        <Text className="text-cr-muted text-sm leading-5">
                            Earn 90,000 Membership Rewards® Points after you spend $6,000 on eligible purchases on your new Card in your first 6 months of Card Membership.
                        </Text>
                        <Text className="text-cr-gold font-bold mt-3 text-sm">APPLY NOW</Text>
                    </View>
                </TouchableOpacity>

                {/* Promo Card 2 */}
                <TouchableOpacity className="bg-cr-card rounded-xl overflow-hidden mb-6 border border-gray-800">
                    <View className="h-32 bg-blue-900 justify-center items-center">
                        <Text className="text-white font-bold text-xl tracking-widest">CHASE SAPPHIRE</Text>
                    </View>
                    <View className="p-4">
                        <Text className="text-cr-text font-bold text-lg mb-1">60,000 Bonus Points</Text>
                        <Text className="text-cr-muted text-sm leading-5">
                            Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months from account opening. That's $750 toward travel when you redeem through Chase Travel℠.
                        </Text>
                        <Text className="text-cr-gold font-bold mt-3 text-sm">APPLY NOW</Text>
                    </View>
                </TouchableOpacity>

                {/* Promo Card 3 */}
                <TouchableOpacity className="bg-cr-card rounded-xl overflow-hidden mb-6 border border-gray-800">
                    <View className="h-32 bg-gray-800 justify-center items-center">
                        <Text className="text-gray-400 font-bold text-xl tracking-widest">CAPITAL ONE</Text>
                    </View>
                    <View className="p-4">
                        <Text className="text-cr-text font-bold text-lg mb-1">75,000 Miles</Text>
                        <Text className="text-cr-muted text-sm leading-5">
                            Earn 75,000 bonus miles when you spend $4,000 on purchases in the first 3 months from account opening, equal to $750 in travel.
                        </Text>
                        <Text className="text-cr-gold font-bold mt-3 text-sm">APPLY NOW</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
