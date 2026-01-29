export const SLOGANS = [
    "Reign Over Your Credit",
    "Crown Your Financial Victory!",
    "Rule Your Scores Like Royalty",
    "Your Kingdom, Your Credit, Your Rules",
    "Ascend to Financial Greatness",
    "Heavy is the Wallet that Wears the Crown",
    "Conquer Your Debt, Claim Your Throne",
    "Royal Status: Pending...",
    "A King Does Not Stress Over Interest",
    "Make Your Credit History Legendary"
];

export const getRandomSlogan = () => {
    const randomIndex = Math.floor(Math.random() * SLOGANS.length);
    return SLOGANS[randomIndex];
};
