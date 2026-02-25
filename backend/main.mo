import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Approval system state
  let approvalState = UserApproval.initState(accessControlState);

  // Approval endpoints (required by guided development)
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  include MixinStorage();

  public type PersistentEncryptedData = {
    blob : Storage.ExternalBlob;
    size : Nat;
  };

  public type PersistentUserProfile = {
    name : Text;
    encryptedData : PersistentEncryptedData;
  };

  public type PersistentCategory = {
    #banking;
    #socialMedia;
    #crypto;
    #cloud;
    #other;
  };

  public type PersistentDigitalAsset = {
    platform : Text;
    username : Text;
    encryptedPassword : PersistentEncryptedData;
    category : PersistentCategory;
  };

  public type PersistentRelationship = {
    #spouse;
    #child;
    #sibling;
    #legalRepresentative;
    #other;
  };

  public type PersistentVerificationStatus = {
    #pending;
    #verified;
    #rejected;
  };

  public type PersistentNominee = {
    name : Text;
    relationship : PersistentRelationship;
    idProof : PersistentEncryptedData;
    verificationStatus : PersistentVerificationStatus;
  };

  public type PersistentLegalVerification = {
    status : {
      #pending;
      #approved;
      #rejected;
    };
    auditTrail : [Text];
  };

  public type PersistentAccountState = {
    alive : Bool;
    timeOfDeath : ?Time.Time;
  };

  public type PersistentDigitalAssetInput = {
    platform : Text;
    username : Text;
    encryptedPassword : PersistentEncryptedData;
    category : PersistentCategory;
  };

  public type PersistentNomineeInput = {
    name : Text;
    relationship : PersistentRelationship;
    idProof : PersistentEncryptedData;
  };

  public type PersistentActivityLog = {
    timestamp : Time.Time;
    action : Text;
    principal : Principal;
  };

  public type PersistentDeathVerificationStatus = {
    #PendingVerification;
    #Approved;
    #Rejected;
  };

  public type PersistentDeathVerificationRequest = {
    deceasedFullName : Text;
    deceasedEmail : Text;
    heirFullName : Text;
    relationshipToDeceased : Text;
    governmentIdBlob : Blob;
    deathCertificateBlob : Blob;
    relationshipProofBlob : ?Blob;
    status : PersistentDeathVerificationStatus;
    submittedAt : Int;
    requestId : Nat;
  };

  let userProfiles = Map.empty<Principal, PersistentUserProfile>();
  let digitalAssets = Map.empty<Principal, List.List<PersistentDigitalAsset>>();
  let nominees = Map.empty<Principal, List.List<PersistentNominee>>();
  let legalVerifications = Map.empty<Principal, PersistentLegalVerification>();
  let accountStates = Map.empty<Principal, PersistentAccountState>();
  let activityLogs = List.empty<PersistentActivityLog>();
  let deathVerificationRequests = Map.empty<Nat, PersistentDeathVerificationRequest>();
  var nextRequestId = 0;

  // ─── User Profile ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?PersistentUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PersistentUserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : PersistentUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Digital Assets ──────────────────────────────────────────────────────────

  /// Returns the caller's own digital assets. Requires authenticated user role.
  public query ({ caller }) func getAssets() : async [PersistentDigitalAsset] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their assets");
    };
    switch (digitalAssets.get(caller)) {
      case (null) { [] };
      case (?assets) { assets.toArray() };
    };
  };

  /// Adds a digital asset for the caller. Requires authenticated user role.
  public shared ({ caller }) func addAsset(assetInput : PersistentDigitalAssetInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add assets");
    };
    let newAsset : PersistentDigitalAsset = {
      platform = assetInput.platform;
      username = assetInput.username;
      encryptedPassword = assetInput.encryptedPassword;
      category = assetInput.category;
    };

    let updatedAssets = switch (digitalAssets.get(caller)) {
      case (null) { List.singleton<PersistentDigitalAsset>(newAsset) };
      case (?assets) {
        assets.add(newAsset);
        assets;
      };
    };

    digitalAssets.add(caller, updatedAssets);

    activityLogs.add({
      timestamp = Time.now();
      action = "Asset added: " # assetInput.platform;
      principal = caller;
    });
  };

  /// Removes a digital asset at the given index for the caller. Requires authenticated user role.
  public shared ({ caller }) func removeAsset(assetIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove assets");
    };
    switch (digitalAssets.get(caller)) {
      case (null) { Runtime.trap("No assets found for this user") };
      case (?currentAssets) {
        let assetsArray = currentAssets.toArray();
        if (assetIndex >= assetsArray.size()) {
          Runtime.trap("Invalid asset index");
        };
        let updatedList = List.empty<PersistentDigitalAsset>();
        var i = 0;
        for (asset in assetsArray.values()) {
          if (i != assetIndex) { updatedList.add(asset) };
          i += 1;
        };
        digitalAssets.add(caller, updatedList);
        activityLogs.add({
          timestamp = Time.now();
          action = "Asset removed at index: " # assetIndex.toText();
          principal = caller;
        });
      };
    };
  };

  // ─── Nominees ────────────────────────────────────────────────────────────────

  /// Returns the caller's own nominees. Requires authenticated user role.
  public query ({ caller }) func getNominees() : async [PersistentNominee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their nominees");
    };
    switch (nominees.get(caller)) {
      case (null) { [] };
      case (?nomineesList) { nomineesList.toArray() };
    };
  };

  /// Adds a nominee for the caller. Requires authenticated user role.
  public shared ({ caller }) func addNominee(nomineeInput : PersistentNomineeInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add nominees");
    };
    let newNominee : PersistentNominee = {
      name = nomineeInput.name;
      relationship = nomineeInput.relationship;
      idProof = nomineeInput.idProof;
      verificationStatus = #pending;
    };

    let updatedNominees = switch (nominees.get(caller)) {
      case (null) { List.singleton<PersistentNominee>(newNominee) };
      case (?nomineesList) {
        nomineesList.add(newNominee);
        nomineesList;
      };
    };

    nominees.add(caller, updatedNominees);

    activityLogs.add({
      timestamp = Time.now();
      action = "Nominee added: " # nomineeInput.name;
      principal = caller;
    });
  };

  /// Removes a nominee at the given index for the caller. Requires authenticated user role.
  public shared ({ caller }) func removeNominee(nomineeIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove nominees");
    };
    switch (nominees.get(caller)) {
      case (null) { Runtime.trap("No nominees found for this user") };
      case (?currentNominees) {
        let nomineesArray = currentNominees.toArray();
        if (nomineeIndex >= nomineesArray.size()) {
          Runtime.trap("Invalid nominee index");
        };
        let updatedList = List.empty<PersistentNominee>();
        var i = 0;
        for (nominee in nomineesArray.values()) {
          if (i != nomineeIndex) { updatedList.add(nominee) };
          i += 1;
        };
        nominees.add(caller, updatedList);
        activityLogs.add({
          timestamp = Time.now();
          action = "Nominee removed at index: " # nomineeIndex.toText();
          principal = caller;
        });
      };
    };
  };

  /// Admin-only: Sets the verification status of a nominee for a given user.
  public shared ({ caller }) func setNomineeVerificationStatus(
    user : Principal,
    nomineeIndex : Nat,
    status : PersistentVerificationStatus,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can verify nominees");
    };
    switch (nominees.get(user)) {
      case (null) { Runtime.trap("No nominees found for this user") };
      case (?currentNominees) {
        let nomineesArray = currentNominees.toArray();
        if (nomineeIndex >= nomineesArray.size()) {
          Runtime.trap("Invalid nominee index");
        };
        let updatedList = List.empty<PersistentNominee>();
        var i = 0;
        for (nominee in nomineesArray.values()) {
          if (i == nomineeIndex) {
            updatedList.add({
              name = nominee.name;
              relationship = nominee.relationship;
              idProof = nominee.idProof;
              verificationStatus = status;
            });
          } else { updatedList.add(nominee) };
          i += 1;
        };
        nominees.add(user, updatedList);

        let statusText = switch (status) {
          case (#pending) { "pending" };
          case (#verified) { "verified" };
          case (#rejected) { "rejected" };
        };
        activityLogs.add({
          timestamp = Time.now();
          action = "Nominee at index " # nomineeIndex.toText() # " for user " # user.toText() # " set to " # statusText;
          principal = caller;
        });
      };
    };
  };

  // ─── Legal Verification ──────────────────────────────────────────────────────

  /// Returns the legal verification record for the caller. Requires authenticated user role.
  public query ({ caller }) func getLegalVerification() : async ?PersistentLegalVerification {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their legal verification");
    };
    legalVerifications.get(caller);
  };

  /// Admin-only: Returns the legal verification record for a given user.
  public query ({ caller }) func getLegalVerificationForUser(user : Principal) : async ?PersistentLegalVerification {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view legal verifications for other users");
    };
    legalVerifications.get(user);
  };

  /// Initiates a legal verification request for the caller (e.g., submitting a death certificate).
  /// Requires authenticated user role.
  public shared ({ caller }) func initiateLegalVerification() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can initiate legal verification");
    };
    let existing = legalVerifications.get(caller);
    let currentAudit = switch (existing) {
      case (null) { [] };
      case (?v) { v.auditTrail };
    };
    let newEntry = "Verification initiated at " # Time.now().toText();
    let updatedAudit = currentAudit.concat([newEntry]);
    legalVerifications.add(caller, {
      status = #pending;
      auditTrail = updatedAudit;
    });
    activityLogs.add({
      timestamp = Time.now();
      action = "Legal verification initiated by user: " # caller.toText();
      principal = caller;
    });
  };

  /// Admin-only: Approves the legal verification for a given user.
  public shared ({ caller }) func approveLegalVerification(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve legal verifications");
    };
    let existing = legalVerifications.get(user);
    let currentAudit = switch (existing) {
      case (null) { [] };
      case (?v) { v.auditTrail };
    };
    let newEntry = "Approved by admin " # caller.toText() # " at " # Time.now().toText();
    let updatedAudit = currentAudit.concat([newEntry]);
    legalVerifications.add(user, {
      status = #approved;
      auditTrail = updatedAudit;
    });
    activityLogs.add({
      timestamp = Time.now();
      action = "Legal verification approved for user: " # user.toText();
      principal = caller;
    });
  };

  /// Admin-only: Rejects the legal verification for a given user.
  public shared ({ caller }) func rejectLegalVerification(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject legal verifications");
    };
    let existing = legalVerifications.get(user);
    let currentAudit = switch (existing) {
      case (null) { [] };
      case (?v) { v.auditTrail };
    };
    let newEntry = "Rejected by admin " # caller.toText() # " at " # Time.now().toText();
    let updatedAudit = currentAudit.concat([newEntry]);
    legalVerifications.add(user, {
      status = #rejected;
      auditTrail = updatedAudit;
    });
    activityLogs.add({
      timestamp = Time.now();
      action = "Legal verification rejected for user: " # user.toText();
      principal = caller;
    });
  };

  // ─── Account State ───────────────────────────────────────────────────────────

  /// Returns the account state for the caller. Requires authenticated user role.
  public query ({ caller }) func getAccountState() : async ?PersistentAccountState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their account state");
    };
    accountStates.get(caller);
  };

  /// Admin-only: Updates the account state (alive/deceased) for a given user.
  /// Only admins may declare a user deceased, as this triggers controlled access release.
  public shared ({ caller }) func updateAccountState(user : Principal, alive : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update account state");
    };
    accountStates.add(
      user,
      {
        alive = alive;
        timeOfDeath = if (alive) { null } else { ?Time.now() };
      },
    );
    activityLogs.add({
      timestamp = Time.now();
      action = "Account state updated for user " # user.toText() # ": alive=" # alive.toText();
      principal = caller;
    });
  };

  // ─── Activity Logs ───────────────────────────────────────────────────────────

  /// Admin-only: Returns all activity logs.
  public query ({ caller }) func getActivityLogs() : async [PersistentActivityLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view activity logs");
    };
    activityLogs.toArray();
  };

  /// Returns activity logs relevant to the caller (filtered by principal field). Requires authenticated user role.
  public query ({ caller }) func getCallerActivityLogs() : async [PersistentActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their activity logs");
    };
    let allLogs = activityLogs.toArray();
    allLogs.filter(func(log : PersistentActivityLog) : Bool { log.principal == caller });
  };

  // ─── Controlled Access Release ───────────────────────────────────────────────

  /// Admin-only: Records an access release event for a given user and logs it.
  public shared ({ caller }) func recordAccessRelease(user : Principal, note : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record access release events");
    };
    activityLogs.add({
      timestamp = Time.now();
      action = "Access released for user " # user.toText() # ": " # note;
      principal = caller;
    });
  };

  // ─── Death Verification Requests ─────────────────────────────────────────────

  public shared ({ caller }) func submitDeathVerificationRequest(
    deceasedFullName : Text,
    deceasedEmail : Text,
    heirFullName : Text,
    relationshipToDeceased : Text,
    governmentIdBlob : Blob,
    deathCertificateBlob : Blob,
    relationshipProofBlob : ?Blob,
  ) : async Nat {
    let requestId = nextRequestId;
    nextRequestId += 1;

    let newRequest : PersistentDeathVerificationRequest = {
      requestId;
      deceasedFullName;
      deceasedEmail;
      heirFullName;
      relationshipToDeceased;
      governmentIdBlob;
      deathCertificateBlob;
      relationshipProofBlob;
      status = #PendingVerification;
      submittedAt = Time.now();
    };

    deathVerificationRequests.add(requestId, newRequest);

    activityLogs.add({
      timestamp = Time.now();
      action = "Death verification submitted for " # deceasedFullName;
      principal = caller;
    });

    requestId;
  };

  public query ({ caller }) func getDeathVerificationRequests() : async [PersistentDeathVerificationRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view verification requests");
    };
    deathVerificationRequests.values().toArray();
  };

  public shared ({ caller }) func updateDeathVerificationStatus(
    requestId : Nat,
    newStatus : { #Approved; #Rejected },
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update verification status");
    };

    let request = switch (deathVerificationRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?r) { r };
    };

    let updatedRequest : PersistentDeathVerificationRequest = {
      request with
      status = switch (newStatus) {
        case (#Approved) { #Approved };
        case (#Rejected) { #Rejected };
      };
    };

    deathVerificationRequests.add(requestId, updatedRequest);

    activityLogs.add({
      timestamp = Time.now();
      action = "Verification status updated for request " # requestId.toText();
      principal = caller;
    });
  };
};
