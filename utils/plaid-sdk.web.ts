export const create = async (props: any) => {
    console.warn('Plaid Link is not supported on web in this demo.');
};

export const open = async (props: any) => {
    alert('Plaid Link is not supported on web. Please use the mobile app.');
};

export type LinkSuccess = {
    publicToken: string;
    metadata: any;
};

export type LinkExit = {
    error?: {
        displayMessage?: string;
    };
};
