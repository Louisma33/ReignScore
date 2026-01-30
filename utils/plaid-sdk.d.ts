
export type LinkSuccess = {
    publicToken: string;
    metadata: {
        account?: {
            id: string;
            name: string;
        };
        institution?: {
            id: string;
            name: string;
        };
        link_session_id?: string;
    };
};

export type LinkExit = {
    error?: {
        errorCode?: string;
        errorMessage?: string;
        displayMessage?: string;
    };
    metadata?: {
        status?: string;
        link_session_id?: string;
        institution?: {
            id: string;
            name: string;
        };
    };
};

export declare const create: (props: { token: string; noLoadingState?: boolean }) => Promise<void>;
export declare const open: (props: {
    onSuccess: (success: LinkSuccess) => void;
    onExit: (exit: LinkExit) => void;
}) => Promise<void>;
