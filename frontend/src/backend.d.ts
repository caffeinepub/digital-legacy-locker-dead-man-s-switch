import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface PersistentDigitalAssetInput {
    encryptedPassword: PersistentEncryptedData;
    username: string;
    platform: string;
    category: PersistentCategory;
}
export interface PersistentNominee {
    relationship: PersistentRelationship;
    name: string;
    idProof: PersistentEncryptedData;
    verificationStatus: PersistentVerificationStatus;
}
export interface PersistentDigitalAsset {
    encryptedPassword: PersistentEncryptedData;
    username: string;
    platform: string;
    category: PersistentCategory;
}
export interface PersistentDeathVerificationRequest {
    status: PersistentDeathVerificationStatus;
    requestId: bigint;
    governmentIdBlob: Uint8Array;
    submittedAt: bigint;
    deathCertificateBlob: Uint8Array;
    heirFullName: string;
    relationshipProofBlob?: Uint8Array;
    deceasedFullName: string;
    relationshipToDeceased: string;
    deceasedEmail: string;
}
export interface PersistentLegalVerification {
    status: Variant_pending_approved_rejected;
    auditTrail: Array<string>;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PersistentEncryptedData {
    blob: ExternalBlob;
    size: bigint;
}
export interface PersistentAccountState {
    alive: boolean;
    timeOfDeath?: Time;
}
export interface PersistentNomineeInput {
    relationship: PersistentRelationship;
    name: string;
    idProof: PersistentEncryptedData;
}
export interface PersistentActivityLog {
    principal: Principal;
    action: string;
    timestamp: Time;
}
export interface PersistentUserProfile {
    name: string;
    encryptedData: PersistentEncryptedData;
}
export enum PersistentCategory {
    other = "other",
    cloud = "cloud",
    banking = "banking",
    crypto = "crypto",
    socialMedia = "socialMedia"
}
export enum PersistentDeathVerificationStatus {
    PendingVerification = "PendingVerification",
    Approved = "Approved",
    Rejected = "Rejected"
}
export enum PersistentRelationship {
    legalRepresentative = "legalRepresentative",
    other = "other",
    child = "child",
    sibling = "sibling",
    spouse = "spouse"
}
export enum PersistentVerificationStatus {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Approved_Rejected {
    Approved = "Approved",
    Rejected = "Rejected"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    /**
     * / Adds a digital asset for the caller. Requires authenticated user role.
     */
    addAsset(assetInput: PersistentDigitalAssetInput): Promise<void>;
    /**
     * / Adds a nominee for the caller. Requires authenticated user role.
     */
    addNominee(nomineeInput: PersistentNomineeInput): Promise<void>;
    /**
     * / Admin-only: Approves the legal verification for a given user.
     */
    approveLegalVerification(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Returns the account state for the caller. Requires authenticated user role.
     */
    getAccountState(): Promise<PersistentAccountState | null>;
    /**
     * / Admin-only: Returns all activity logs.
     */
    getActivityLogs(): Promise<Array<PersistentActivityLog>>;
    /**
     * / Returns the caller's own digital assets. Requires authenticated user role.
     */
    getAssets(): Promise<Array<PersistentDigitalAsset>>;
    /**
     * / Returns activity logs relevant to the caller (filtered by principal field). Requires authenticated user role.
     */
    getCallerActivityLogs(): Promise<Array<PersistentActivityLog>>;
    getCallerUserProfile(): Promise<PersistentUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeathVerificationRequests(): Promise<Array<PersistentDeathVerificationRequest>>;
    /**
     * / Returns the legal verification record for the caller. Requires authenticated user role.
     */
    getLegalVerification(): Promise<PersistentLegalVerification | null>;
    /**
     * / Admin-only: Returns the legal verification record for a given user.
     */
    getLegalVerificationForUser(user: Principal): Promise<PersistentLegalVerification | null>;
    /**
     * / Returns the caller's own nominees. Requires authenticated user role.
     */
    getNominees(): Promise<Array<PersistentNominee>>;
    getUserProfile(user: Principal): Promise<PersistentUserProfile | null>;
    /**
     * / Initiates a legal verification request for the caller (e.g., submitting a death certificate).
     * / Requires authenticated user role.
     */
    initiateLegalVerification(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    /**
     * / Admin-only: Records an access release event for a given user and logs it.
     */
    recordAccessRelease(user: Principal, note: string): Promise<void>;
    /**
     * / Admin-only: Rejects the legal verification for a given user.
     */
    rejectLegalVerification(user: Principal): Promise<void>;
    /**
     * / Removes a digital asset at the given index for the caller. Requires authenticated user role.
     */
    removeAsset(assetIndex: bigint): Promise<void>;
    /**
     * / Removes a nominee at the given index for the caller. Requires authenticated user role.
     */
    removeNominee(nomineeIndex: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: PersistentUserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    /**
     * / Admin-only: Sets the verification status of a nominee for a given user.
     */
    setNomineeVerificationStatus(user: Principal, nomineeIndex: bigint, status: PersistentVerificationStatus): Promise<void>;
    submitDeathVerificationRequest(deceasedFullName: string, deceasedEmail: string, heirFullName: string, relationshipToDeceased: string, governmentIdBlob: Uint8Array, deathCertificateBlob: Uint8Array, relationshipProofBlob: Uint8Array | null): Promise<bigint>;
    /**
     * / Admin-only: Updates the account state (alive/deceased) for a given user.
     * / Only admins may declare a user deceased, as this triggers controlled access release.
     */
    updateAccountState(user: Principal, alive: boolean): Promise<void>;
    updateDeathVerificationStatus(requestId: bigint, newStatus: Variant_Approved_Rejected): Promise<void>;
}
