# ReignScore App UI/UX Brief for Analysis

## 1. Project Overview
- **Type**: React Native Mobile App (Expo)
- **Navigation Setup**: Expo Router (File-based routing)
- **Styling Strategy**: `StyleSheet` + Custom Themed Components (`ThemedView`, `ThemedText`)
- **Core Theme**: "Global Gold" (`#FFD700`) paired with Dark Mode (`#151718`) or Light Mode (Capital One Blue/White).
- **Goal**: Seeking mobile-first UI/UX improvements, particularly regarding the "Gold" aesthetic and general flow.

## 2. Navigation Structure (`app/_layout.tsx`)
The app uses a Root Stack with the following hierarchy:
- **(tabs)**: Main Application Interface (Bottom Tab Bar)
- **auth**: Authentication Stack (Login, Signup, Forgot Password)
- **onboarding**: Initial user onboarding flow
- **Modals**:
    - `pay`: Payment interface
    - `add-card`: Card addition interface

## 3. Main Screens (Tabs)
Located in `app/(tabs)/`:

### A. Home Dashboard (`index.tsx`)
- **Purpose**: Main overview of financial health.
- **Key Elements**:
    - **Header**: User greeting + Profile Icon (Gold).
    - **Balance Card**: Large display of "Total Balance", "Credit Utilization", and "Total Limit". Background is Gold in the snippet provided.
    - **Quick Actions**: "Add Card to Monitor" button.
    - **Monitored Cards List**: Scrollable list of cards showing Balance, Due Date, and Utilization bars.
- **Aesthetic**: Heavy use of Gold accents (`#FFD700`) for icons, buttons, and progress indicators.

### B. Other Tabs (Inferred)
- **Alerts** (`notifications.tsx`): Notification center.
- **Rewards** (`rewards.tsx`): Rewards program tracking.
- **Settings** (`settings.tsx`): User preferences and configuration.

## 4. Visual Identity & Theme
**Colors** (defined in `constants/theme.ts`):
- **Common Gold**: `#FFD700` (Used extensively for branding)
- **Dark Mode**:
    - Background: `#151718`
    - Card Background: `#FFD700` (Gold)
    - Tab Selected: `#FFD700`
    - Text: `#ECEDEE` or Dark on Gold cards (`#1A1A1A`)
- **Light Mode**:
    - Background: `#F4F5F7`
    - Card Background: `#FFFFFF`
    - Tint: `#004977` (Capital One Blue)

## 5. Key Code Snippets for Context

### Theme Definition (`constants/theme.ts`)
```typescript
export const Colors = {
  common: {
    primary: '#004977',
    accent: '#D03027',
    black: '#000000',
    white: '#FFFFFF',
    textGray: '#666666',
    gold: '#FFD700',
  },
  light: {
    text: '#333333',
    background: '#F4F5F7',
    card: '#FFFFFF',
    tint: '#004977',
    tabIconSelected: '#004977',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    card: '#FFD700',       // Note: Cards are Gold in dark mode
    tint: '#FFD700',
    tabIconSelected: '#FFD700',
    cardText: '#1A1A1A',   // Dark text for readability on Gold
  },
};
```

### Home Screen Structure (`app/(tabs)/index.tsx`)
*Truncated view of the main dashboard component:*
```tsx
export default function HomeScreen() {
  // ... (State & Hooks)

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.greeting}>Monitoring Dashboard</ThemedText>
          <ThemedText type="title">{user?.name || 'My Finance'}</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/settings')}>
          <IconSymbol name="person.circle.fill" size={40} color={Colors.common.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Balance & Utilization Card (Gold Background) */}
        <View style={[styles.balanceCard, { backgroundColor: Colors.common.gold }]}>
          <View>
            <ThemedText style={styles.balanceLabel}>Total Balance</ThemedText>
            <ThemedText style={styles.balanceAmount}>${totalBalance}</ThemedText>
          </View>
          {/* ... Utilization Info ... */}
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: utilization_pct }]} />
          </View>
        </View>

        {/* ... List of Cards ... */}
      </ScrollView>
    </ThemedView>
  );
}
// ... Styles ...
```
