import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  PersistentUserProfile,
  PersistentDigitalAssetInput,
  PersistentNomineeInput,
  PersistentActivityLog,
  PersistentDigitalAsset,
  PersistentNominee,
  PersistentLegalVerification,
  PersistentAccountState,
  PersistentDeathVerificationRequest,
} from '../backend';
import { PersistentCategory, Variant_Approved_Rejected } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<PersistentUserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PersistentUserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 30_000,
  });
}

// ─── Digital Assets ───────────────────────────────────────────────────────────

export function useGetAssets() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentDigitalAsset[]>({
    queryKey: ['assets', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssets();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetInput: PersistentDigitalAssetInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAsset(assetInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useRemoveAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeAsset(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// ─── Nominees ─────────────────────────────────────────────────────────────────

export function useGetNominees() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentNominee[]>({
    queryKey: ['nominees', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNominees();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddNominee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nomineeInput: PersistentNomineeInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNominee(nomineeInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useRemoveNominee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeNominee(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// ─── Legal Verification ───────────────────────────────────────────────────────

export function useGetLegalVerification() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentLegalVerification | null>({
    queryKey: ['legalVerification', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLegalVerification();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useInitiateLegalVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateLegalVerification();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalVerification'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useGetLegalVerificationForUser(user: Principal | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentLegalVerification | null>({
    queryKey: ['legalVerificationForUser', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getLegalVerificationForUser(user);
    },
    enabled: !!actor && !isFetching && !!identity && !!user,
  });
}

export function useApproveLegalVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveLegalVerification(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalVerificationForUser'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

export function useRejectLegalVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectLegalVerification(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalVerificationForUser'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export function useGetCallerActivityLogs() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentActivityLog[]>({
    queryKey: ['activityLogs', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerActivityLogs();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllActivityLogs() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentActivityLog[]>({
    queryKey: ['allActivityLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivityLogs();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ─── Account State ────────────────────────────────────────────────────────────

export function useGetAccountState() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentAccountState | null>({
    queryKey: ['accountState', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAccountState();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateAccountState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, alive }: { user: Principal; alive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAccountState(user, alive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountState'] });
      queryClient.invalidateQueries({ queryKey: ['activityLogs'] });
    },
  });
}

// ─── Access Release ───────────────────────────────────────────────────────────

export function useRecordAccessRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, note }: { user: Principal; note: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordAccessRelease(user, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allActivityLogs'] });
    },
  });
}

// ─── Death Verification Requests ─────────────────────────────────────────────

export function useSubmitDeathVerificationRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      deceasedFullName: string;
      deceasedEmail: string;
      heirFullName: string;
      relationshipToDeceased: string;
      governmentIdBlob: Uint8Array;
      deathCertificateBlob: Uint8Array;
      relationshipProofBlob: Uint8Array | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDeathVerificationRequest(
        payload.deceasedFullName,
        payload.deceasedEmail,
        payload.heirFullName,
        payload.relationshipToDeceased,
        payload.governmentIdBlob,
        payload.deathCertificateBlob,
        payload.relationshipProofBlob,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deathVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allActivityLogs'] });
    },
    onError: () => {
      toast.error('Failed to submit verification request. Please try again.');
    },
  });
}

export function useGetDeathVerificationRequests() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PersistentDeathVerificationRequest[]>({
    queryKey: ['deathVerificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDeathVerificationRequests();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateDeathVerificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
    }: {
      requestId: bigint;
      newStatus: Variant_Approved_Rejected;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDeathVerificationStatus(requestId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deathVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allActivityLogs'] });
    },
    onError: () => {
      toast.error('Failed to update verification status. Please try again.');
    },
  });
}

// ─── Category helpers ─────────────────────────────────────────────────────────

export function getCategoryLabel(cat: PersistentCategory): string {
  const map: Record<PersistentCategory, string> = {
    [PersistentCategory.banking]: 'Banking',
    [PersistentCategory.socialMedia]: 'Social Media',
    [PersistentCategory.crypto]: 'Crypto',
    [PersistentCategory.cloud]: 'Cloud',
    [PersistentCategory.other]: 'Other',
  };
  return map[cat] ?? cat;
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}
