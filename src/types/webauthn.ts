export type User = {
    displayName: string;
    name: string;
    id: string | BufferSource | ArrayBuffer;
}

export type UserOAuth = {
    id: string;
    iid: string;
    ca: string;
}
