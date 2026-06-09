import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminStats, AdoptionRequest, AiChat200, AiChatBody, AiGenerateDescription200, AiGenerateDescriptionBody, AiRecommend200, AiRecommendBody, AuthUser, CapturePaypalOrder200, CapturePaypalOrderBody, ConfirmCliqDonationBody, ConfirmStripePayment200, ConfirmStripePaymentBody, CreateAdoptionRequestInput, CreateDonationInput, CreateFosterRequestInput, CreateGalleryPostInput, CreateLostFoundReportInput, CreateMessageInput, CreatePaypalOrder200, CreatePaypalOrderBody, CreatePetInput, CreateStripePaymentIntent200, CreateStripePaymentIntentBody, Donation, ErrorResponse, FosterRequest, GalleryPost, GetPaymentConfig200, HealthStatus, ListAdminLostFoundReportsParams, ListAdminUsersParams, ListAdoptionRequestsParams, ListDonationsParams, ListFosterRequestsParams, ListGalleryPostsParams, ListLostFoundReportsParams, ListPetsParams, LoginBody, LostFoundListResponse, LostFoundReport, Message, MyApplicationsResponse, Pet, PetListResponse, RegisterBody, SuccessResponse, ToggleFavouriteInput, UpdatePetInput, UpdateRequestStatusInput, UpdateUserInput, User, UserOnboardingInput } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Register a new user account
 */
export declare const getRegisterUrl: () => string;
export declare const register: (registerBody: RegisterBody, options?: RequestInit) => Promise<AuthUser>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterBody>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Register a new user account
 */
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterBody>;
}, TContext>;
/**
 * @summary Log in with email and password
 */
export declare const getLoginUrl: () => string;
export declare const login: (loginBody: LoginBody, options?: RequestInit) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginBody>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Log in with email and password
 */
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginBody>;
}, TContext>;
/**
 * @summary Log out current user
 */
export declare const getLogoutUrl: () => string;
export declare const logout: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
 * @summary Log out current user
 */
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List pets with filters
 */
export declare const getListPetsUrl: (params?: ListPetsParams) => string;
export declare const listPets: (params?: ListPetsParams, options?: RequestInit) => Promise<PetListResponse>;
export declare const getListPetsQueryKey: (params?: ListPetsParams) => readonly ["/api/pets", ...ListPetsParams[]];
export declare const getListPetsQueryOptions: <TData = Awaited<ReturnType<typeof listPets>>, TError = ErrorType<unknown>>(params?: ListPetsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPetsQueryResult = NonNullable<Awaited<ReturnType<typeof listPets>>>;
export type ListPetsQueryError = ErrorType<unknown>;
/**
 * @summary List pets with filters
 */
export declare function useListPets<TData = Awaited<ReturnType<typeof listPets>>, TError = ErrorType<unknown>>(params?: ListPetsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new pet listing
 */
export declare const getCreatePetUrl: () => string;
export declare const createPet: (createPetInput: CreatePetInput, options?: RequestInit) => Promise<Pet>;
export declare const getCreatePetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPet>>, TError, {
        data: BodyType<CreatePetInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPet>>, TError, {
    data: BodyType<CreatePetInput>;
}, TContext>;
export type CreatePetMutationResult = NonNullable<Awaited<ReturnType<typeof createPet>>>;
export type CreatePetMutationBody = BodyType<CreatePetInput>;
export type CreatePetMutationError = ErrorType<unknown>;
/**
 * @summary Create a new pet listing
 */
export declare const useCreatePet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPet>>, TError, {
        data: BodyType<CreatePetInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPet>>, TError, {
    data: BodyType<CreatePetInput>;
}, TContext>;
/**
 * @summary Get featured pets for home page
 */
export declare const getGetFeaturedPetsUrl: () => string;
export declare const getFeaturedPets: (options?: RequestInit) => Promise<Pet[]>;
export declare const getGetFeaturedPetsQueryKey: () => readonly ["/api/pets/featured"];
export declare const getGetFeaturedPetsQueryOptions: <TData = Awaited<ReturnType<typeof getFeaturedPets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeaturedPetsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeaturedPets>>>;
export type GetFeaturedPetsQueryError = ErrorType<unknown>;
/**
 * @summary Get featured pets for home page
 */
export declare function useGetFeaturedPets<TData = Awaited<ReturnType<typeof getFeaturedPets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get pet detail
 */
export declare const getGetPetUrl: (id: number) => string;
export declare const getPet: (id: number, options?: RequestInit) => Promise<Pet>;
export declare const getGetPetQueryKey: (id: number) => readonly [`/api/pets/${number}`];
export declare const getGetPetQueryOptions: <TData = Awaited<ReturnType<typeof getPet>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPet>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPetQueryResult = NonNullable<Awaited<ReturnType<typeof getPet>>>;
export type GetPetQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get pet detail
 */
export declare function useGetPet<TData = Awaited<ReturnType<typeof getPet>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a pet listing
 */
export declare const getUpdatePetUrl: (id: number) => string;
export declare const updatePet: (id: number, updatePetInput: UpdatePetInput, options?: RequestInit) => Promise<Pet>;
export declare const getUpdatePetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePet>>, TError, {
        id: number;
        data: BodyType<UpdatePetInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePet>>, TError, {
    id: number;
    data: BodyType<UpdatePetInput>;
}, TContext>;
export type UpdatePetMutationResult = NonNullable<Awaited<ReturnType<typeof updatePet>>>;
export type UpdatePetMutationBody = BodyType<UpdatePetInput>;
export type UpdatePetMutationError = ErrorType<unknown>;
/**
 * @summary Update a pet listing
 */
export declare const useUpdatePet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePet>>, TError, {
        id: number;
        data: BodyType<UpdatePetInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePet>>, TError, {
    id: number;
    data: BodyType<UpdatePetInput>;
}, TContext>;
/**
 * @summary Delete a pet listing
 */
export declare const getDeletePetUrl: (id: number) => string;
export declare const deletePet: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeletePetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePet>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePet>>, TError, {
    id: number;
}, TContext>;
export type DeletePetMutationResult = NonNullable<Awaited<ReturnType<typeof deletePet>>>;
export type DeletePetMutationError = ErrorType<unknown>;
/**
 * @summary Delete a pet listing
 */
export declare const useDeletePet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePet>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePet>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Toggle favourite for a pet
 */
export declare const getToggleFavouriteUrl: (id: number) => string;
export declare const toggleFavourite: (id: number, toggleFavouriteInput: ToggleFavouriteInput, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getToggleFavouriteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleFavourite>>, TError, {
        id: number;
        data: BodyType<ToggleFavouriteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof toggleFavourite>>, TError, {
    id: number;
    data: BodyType<ToggleFavouriteInput>;
}, TContext>;
export type ToggleFavouriteMutationResult = NonNullable<Awaited<ReturnType<typeof toggleFavourite>>>;
export type ToggleFavouriteMutationBody = BodyType<ToggleFavouriteInput>;
export type ToggleFavouriteMutationError = ErrorType<unknown>;
/**
 * @summary Toggle favourite for a pet
 */
export declare const useToggleFavourite: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleFavourite>>, TError, {
        id: number;
        data: BodyType<ToggleFavouriteInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof toggleFavourite>>, TError, {
    id: number;
    data: BodyType<ToggleFavouriteInput>;
}, TContext>;
/**
 * @summary List adoption requests
 */
export declare const getListAdoptionRequestsUrl: (params?: ListAdoptionRequestsParams) => string;
export declare const listAdoptionRequests: (params?: ListAdoptionRequestsParams, options?: RequestInit) => Promise<AdoptionRequest[]>;
export declare const getListAdoptionRequestsQueryKey: (params?: ListAdoptionRequestsParams) => readonly ["/api/adoption-requests", ...ListAdoptionRequestsParams[]];
export declare const getListAdoptionRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listAdoptionRequests>>, TError = ErrorType<unknown>>(params?: ListAdoptionRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdoptionRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdoptionRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdoptionRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdoptionRequests>>>;
export type ListAdoptionRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List adoption requests
 */
export declare function useListAdoptionRequests<TData = Awaited<ReturnType<typeof listAdoptionRequests>>, TError = ErrorType<unknown>>(params?: ListAdoptionRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdoptionRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit an adoption request
 */
export declare const getCreateAdoptionRequestUrl: () => string;
export declare const createAdoptionRequest: (createAdoptionRequestInput: CreateAdoptionRequestInput, options?: RequestInit) => Promise<AdoptionRequest>;
export declare const getCreateAdoptionRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdoptionRequest>>, TError, {
        data: BodyType<CreateAdoptionRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdoptionRequest>>, TError, {
    data: BodyType<CreateAdoptionRequestInput>;
}, TContext>;
export type CreateAdoptionRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createAdoptionRequest>>>;
export type CreateAdoptionRequestMutationBody = BodyType<CreateAdoptionRequestInput>;
export type CreateAdoptionRequestMutationError = ErrorType<unknown>;
/**
 * @summary Submit an adoption request
 */
export declare const useCreateAdoptionRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdoptionRequest>>, TError, {
        data: BodyType<CreateAdoptionRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdoptionRequest>>, TError, {
    data: BodyType<CreateAdoptionRequestInput>;
}, TContext>;
/**
 * @summary Approve or reject an adoption request
 */
export declare const getUpdateAdoptionRequestStatusUrl: (id: number) => string;
export declare const updateAdoptionRequestStatus: (id: number, updateRequestStatusInput: UpdateRequestStatusInput, options?: RequestInit) => Promise<AdoptionRequest>;
export declare const getUpdateAdoptionRequestStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdoptionRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateRequestStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdoptionRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateRequestStatusInput>;
}, TContext>;
export type UpdateAdoptionRequestStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdoptionRequestStatus>>>;
export type UpdateAdoptionRequestStatusMutationBody = BodyType<UpdateRequestStatusInput>;
export type UpdateAdoptionRequestStatusMutationError = ErrorType<unknown>;
/**
 * @summary Approve or reject an adoption request
 */
export declare const useUpdateAdoptionRequestStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdoptionRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateRequestStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdoptionRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateRequestStatusInput>;
}, TContext>;
/**
 * @summary List foster requests
 */
export declare const getListFosterRequestsUrl: (params?: ListFosterRequestsParams) => string;
export declare const listFosterRequests: (params?: ListFosterRequestsParams, options?: RequestInit) => Promise<FosterRequest[]>;
export declare const getListFosterRequestsQueryKey: (params?: ListFosterRequestsParams) => readonly ["/api/foster-requests", ...ListFosterRequestsParams[]];
export declare const getListFosterRequestsQueryOptions: <TData = Awaited<ReturnType<typeof listFosterRequests>>, TError = ErrorType<unknown>>(params?: ListFosterRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFosterRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFosterRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFosterRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof listFosterRequests>>>;
export type ListFosterRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List foster requests
 */
export declare function useListFosterRequests<TData = Awaited<ReturnType<typeof listFosterRequests>>, TError = ErrorType<unknown>>(params?: ListFosterRequestsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFosterRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit a foster request
 */
export declare const getCreateFosterRequestUrl: () => string;
export declare const createFosterRequest: (createFosterRequestInput: CreateFosterRequestInput, options?: RequestInit) => Promise<FosterRequest>;
export declare const getCreateFosterRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFosterRequest>>, TError, {
        data: BodyType<CreateFosterRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFosterRequest>>, TError, {
    data: BodyType<CreateFosterRequestInput>;
}, TContext>;
export type CreateFosterRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createFosterRequest>>>;
export type CreateFosterRequestMutationBody = BodyType<CreateFosterRequestInput>;
export type CreateFosterRequestMutationError = ErrorType<unknown>;
/**
 * @summary Submit a foster request
 */
export declare const useCreateFosterRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFosterRequest>>, TError, {
        data: BodyType<CreateFosterRequestInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFosterRequest>>, TError, {
    data: BodyType<CreateFosterRequestInput>;
}, TContext>;
/**
 * @summary Approve or reject a foster request
 */
export declare const getUpdateFosterRequestStatusUrl: (id: number) => string;
export declare const updateFosterRequestStatus: (id: number, updateRequestStatusInput: UpdateRequestStatusInput, options?: RequestInit) => Promise<FosterRequest>;
export declare const getUpdateFosterRequestStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFosterRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateRequestStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFosterRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateRequestStatusInput>;
}, TContext>;
export type UpdateFosterRequestStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateFosterRequestStatus>>>;
export type UpdateFosterRequestStatusMutationBody = BodyType<UpdateRequestStatusInput>;
export type UpdateFosterRequestStatusMutationError = ErrorType<unknown>;
/**
 * @summary Approve or reject a foster request
 */
export declare const useUpdateFosterRequestStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFosterRequestStatus>>, TError, {
        id: number;
        data: BodyType<UpdateRequestStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFosterRequestStatus>>, TError, {
    id: number;
    data: BodyType<UpdateRequestStatusInput>;
}, TContext>;
/**
 * @summary List donations
 */
export declare const getListDonationsUrl: (params?: ListDonationsParams) => string;
export declare const listDonations: (params?: ListDonationsParams, options?: RequestInit) => Promise<Donation[]>;
export declare const getListDonationsQueryKey: (params?: ListDonationsParams) => readonly ["/api/donations", ...ListDonationsParams[]];
export declare const getListDonationsQueryOptions: <TData = Awaited<ReturnType<typeof listDonations>>, TError = ErrorType<unknown>>(params?: ListDonationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDonations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDonations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDonationsQueryResult = NonNullable<Awaited<ReturnType<typeof listDonations>>>;
export type ListDonationsQueryError = ErrorType<unknown>;
/**
 * @summary List donations
 */
export declare function useListDonations<TData = Awaited<ReturnType<typeof listDonations>>, TError = ErrorType<unknown>>(params?: ListDonationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDonations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit a donation
 */
export declare const getCreateDonationUrl: () => string;
export declare const createDonation: (createDonationInput: CreateDonationInput, options?: RequestInit) => Promise<Donation>;
export declare const getCreateDonationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDonation>>, TError, {
        data: BodyType<CreateDonationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDonation>>, TError, {
    data: BodyType<CreateDonationInput>;
}, TContext>;
export type CreateDonationMutationResult = NonNullable<Awaited<ReturnType<typeof createDonation>>>;
export type CreateDonationMutationBody = BodyType<CreateDonationInput>;
export type CreateDonationMutationError = ErrorType<unknown>;
/**
 * @summary Submit a donation
 */
export declare const useCreateDonation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDonation>>, TError, {
        data: BodyType<CreateDonationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDonation>>, TError, {
    data: BodyType<CreateDonationInput>;
}, TContext>;
/**
 * @summary List gallery posts
 */
export declare const getListGalleryPostsUrl: (params?: ListGalleryPostsParams) => string;
export declare const listGalleryPosts: (params?: ListGalleryPostsParams, options?: RequestInit) => Promise<GalleryPost[]>;
export declare const getListGalleryPostsQueryKey: (params?: ListGalleryPostsParams) => readonly ["/api/gallery", ...ListGalleryPostsParams[]];
export declare const getListGalleryPostsQueryOptions: <TData = Awaited<ReturnType<typeof listGalleryPosts>>, TError = ErrorType<unknown>>(params?: ListGalleryPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGalleryPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGalleryPosts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGalleryPostsQueryResult = NonNullable<Awaited<ReturnType<typeof listGalleryPosts>>>;
export type ListGalleryPostsQueryError = ErrorType<unknown>;
/**
 * @summary List gallery posts
 */
export declare function useListGalleryPosts<TData = Awaited<ReturnType<typeof listGalleryPosts>>, TError = ErrorType<unknown>>(params?: ListGalleryPostsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGalleryPosts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a gallery post
 */
export declare const getCreateGalleryPostUrl: () => string;
export declare const createGalleryPost: (createGalleryPostInput: CreateGalleryPostInput, options?: RequestInit) => Promise<GalleryPost>;
export declare const getCreateGalleryPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGalleryPost>>, TError, {
        data: BodyType<CreateGalleryPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGalleryPost>>, TError, {
    data: BodyType<CreateGalleryPostInput>;
}, TContext>;
export type CreateGalleryPostMutationResult = NonNullable<Awaited<ReturnType<typeof createGalleryPost>>>;
export type CreateGalleryPostMutationBody = BodyType<CreateGalleryPostInput>;
export type CreateGalleryPostMutationError = ErrorType<unknown>;
/**
 * @summary Create a gallery post
 */
export declare const useCreateGalleryPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGalleryPost>>, TError, {
        data: BodyType<CreateGalleryPostInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGalleryPost>>, TError, {
    data: BodyType<CreateGalleryPostInput>;
}, TContext>;
/**
 * @summary Get a single gallery post
 */
export declare const getGetGalleryPostUrl: (id: number) => string;
export declare const getGalleryPost: (id: number, options?: RequestInit) => Promise<GalleryPost>;
export declare const getGetGalleryPostQueryKey: (id: number) => readonly [`/api/gallery/${number}`];
export declare const getGetGalleryPostQueryOptions: <TData = Awaited<ReturnType<typeof getGalleryPost>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGalleryPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGalleryPost>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGalleryPostQueryResult = NonNullable<Awaited<ReturnType<typeof getGalleryPost>>>;
export type GetGalleryPostQueryError = ErrorType<unknown>;
/**
 * @summary Get a single gallery post
 */
export declare function useGetGalleryPost<TData = Awaited<ReturnType<typeof getGalleryPost>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGalleryPost>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List lost and found reports
 */
export declare const getListLostFoundReportsUrl: (params?: ListLostFoundReportsParams) => string;
export declare const listLostFoundReports: (params?: ListLostFoundReportsParams, options?: RequestInit) => Promise<LostFoundListResponse>;
export declare const getListLostFoundReportsQueryKey: (params?: ListLostFoundReportsParams) => readonly ["/api/lost-found", ...ListLostFoundReportsParams[]];
export declare const getListLostFoundReportsQueryOptions: <TData = Awaited<ReturnType<typeof listLostFoundReports>>, TError = ErrorType<unknown>>(params?: ListLostFoundReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLostFoundReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLostFoundReports>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLostFoundReportsQueryResult = NonNullable<Awaited<ReturnType<typeof listLostFoundReports>>>;
export type ListLostFoundReportsQueryError = ErrorType<unknown>;
/**
 * @summary List lost and found reports
 */
export declare function useListLostFoundReports<TData = Awaited<ReturnType<typeof listLostFoundReports>>, TError = ErrorType<unknown>>(params?: ListLostFoundReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLostFoundReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Report a lost or found pet
 */
export declare const getCreateLostFoundReportUrl: () => string;
export declare const createLostFoundReport: (createLostFoundReportInput: CreateLostFoundReportInput, options?: RequestInit) => Promise<LostFoundReport>;
export declare const getCreateLostFoundReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createLostFoundReport>>, TError, {
        data: BodyType<CreateLostFoundReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createLostFoundReport>>, TError, {
    data: BodyType<CreateLostFoundReportInput>;
}, TContext>;
export type CreateLostFoundReportMutationResult = NonNullable<Awaited<ReturnType<typeof createLostFoundReport>>>;
export type CreateLostFoundReportMutationBody = BodyType<CreateLostFoundReportInput>;
export type CreateLostFoundReportMutationError = ErrorType<unknown>;
/**
 * @summary Report a lost or found pet
 */
export declare const useCreateLostFoundReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createLostFoundReport>>, TError, {
        data: BodyType<CreateLostFoundReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createLostFoundReport>>, TError, {
    data: BodyType<CreateLostFoundReportInput>;
}, TContext>;
/**
 * @summary Get a lost/found report detail
 */
export declare const getGetLostFoundReportUrl: (id: number) => string;
export declare const getLostFoundReport: (id: number, options?: RequestInit) => Promise<LostFoundReport>;
export declare const getGetLostFoundReportQueryKey: (id: number) => readonly [`/api/lost-found/${number}`];
export declare const getGetLostFoundReportQueryOptions: <TData = Awaited<ReturnType<typeof getLostFoundReport>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLostFoundReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLostFoundReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLostFoundReportQueryResult = NonNullable<Awaited<ReturnType<typeof getLostFoundReport>>>;
export type GetLostFoundReportQueryError = ErrorType<unknown>;
/**
 * @summary Get a lost/found report detail
 */
export declare function useGetLostFoundReport<TData = Awaited<ReturnType<typeof getLostFoundReport>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLostFoundReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete a lost/found report
 */
export declare const getDeleteLostFoundReportUrl: (id: number) => string;
export declare const deleteLostFoundReport: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteLostFoundReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteLostFoundReport>>, TError, {
    id: number;
}, TContext>;
export type DeleteLostFoundReportMutationResult = NonNullable<Awaited<ReturnType<typeof deleteLostFoundReport>>>;
export type DeleteLostFoundReportMutationError = ErrorType<unknown>;
/**
 * @summary Delete a lost/found report
 */
export declare const useDeleteLostFoundReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteLostFoundReport>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Mark a lost/found report as resolved
 */
export declare const getResolveLostFoundReportUrl: (id: number) => string;
export declare const resolveLostFoundReport: (id: number, options?: RequestInit) => Promise<LostFoundReport>;
export declare const getResolveLostFoundReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resolveLostFoundReport>>, TError, {
    id: number;
}, TContext>;
export type ResolveLostFoundReportMutationResult = NonNullable<Awaited<ReturnType<typeof resolveLostFoundReport>>>;
export type ResolveLostFoundReportMutationError = ErrorType<unknown>;
/**
 * @summary Mark a lost/found report as resolved
 */
export declare const useResolveLostFoundReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resolveLostFoundReport>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary List all lost/found reports (admin)
 */
export declare const getListAdminLostFoundReportsUrl: (params?: ListAdminLostFoundReportsParams) => string;
export declare const listAdminLostFoundReports: (params?: ListAdminLostFoundReportsParams, options?: RequestInit) => Promise<LostFoundListResponse>;
export declare const getListAdminLostFoundReportsQueryKey: (params?: ListAdminLostFoundReportsParams) => readonly ["/api/admin/lost-found", ...ListAdminLostFoundReportsParams[]];
export declare const getListAdminLostFoundReportsQueryOptions: <TData = Awaited<ReturnType<typeof listAdminLostFoundReports>>, TError = ErrorType<unknown>>(params?: ListAdminLostFoundReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminLostFoundReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminLostFoundReports>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminLostFoundReportsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminLostFoundReports>>>;
export type ListAdminLostFoundReportsQueryError = ErrorType<unknown>;
/**
 * @summary List all lost/found reports (admin)
 */
export declare function useListAdminLostFoundReports<TData = Awaited<ReturnType<typeof listAdminLostFoundReports>>, TError = ErrorType<unknown>>(params?: ListAdminLostFoundReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminLostFoundReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Approve a lost/found report
 */
export declare const getApproveLostFoundReportUrl: (id: number) => string;
export declare const approveLostFoundReport: (id: number, options?: RequestInit) => Promise<LostFoundReport>;
export declare const getApproveLostFoundReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveLostFoundReport>>, TError, {
    id: number;
}, TContext>;
export type ApproveLostFoundReportMutationResult = NonNullable<Awaited<ReturnType<typeof approveLostFoundReport>>>;
export type ApproveLostFoundReportMutationError = ErrorType<unknown>;
/**
 * @summary Approve a lost/found report
 */
export declare const useApproveLostFoundReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveLostFoundReport>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Reject a lost/found report
 */
export declare const getRejectLostFoundReportUrl: (id: number) => string;
export declare const rejectLostFoundReport: (id: number, options?: RequestInit) => Promise<LostFoundReport>;
export declare const getRejectLostFoundReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rejectLostFoundReport>>, TError, {
    id: number;
}, TContext>;
export type RejectLostFoundReportMutationResult = NonNullable<Awaited<ReturnType<typeof rejectLostFoundReport>>>;
export type RejectLostFoundReportMutationError = ErrorType<unknown>;
/**
 * @summary Reject a lost/found report
 */
export declare const useRejectLostFoundReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectLostFoundReport>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rejectLostFoundReport>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Send a message to a pet owner
 */
export declare const getSendMessageUrl: () => string;
export declare const sendMessage: (createMessageInput: CreateMessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        data: BodyType<CreateMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    data: BodyType<CreateMessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<CreateMessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a message to a pet owner
 */
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        data: BodyType<CreateMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    data: BodyType<CreateMessageInput>;
}, TContext>;
/**
 * @summary Submit adoption readiness onboarding form
 */
export declare const getSubmitOnboardingUrl: () => string;
export declare const submitOnboarding: (userOnboardingInput: UserOnboardingInput, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getSubmitOnboardingMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitOnboarding>>, TError, {
        data: BodyType<UserOnboardingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitOnboarding>>, TError, {
    data: BodyType<UserOnboardingInput>;
}, TContext>;
export type SubmitOnboardingMutationResult = NonNullable<Awaited<ReturnType<typeof submitOnboarding>>>;
export type SubmitOnboardingMutationBody = BodyType<UserOnboardingInput>;
export type SubmitOnboardingMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Submit adoption readiness onboarding form
 */
export declare const useSubmitOnboarding: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitOnboarding>>, TError, {
        data: BodyType<UserOnboardingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitOnboarding>>, TError, {
    data: BodyType<UserOnboardingInput>;
}, TContext>;
/**
 * @summary Get current user profile
 */
export declare const getGetMyProfileUrl: () => string;
export declare const getMyProfile: (options?: RequestInit) => Promise<User>;
export declare const getGetMyProfileQueryKey: () => readonly ["/api/users/me"];
export declare const getGetMyProfileQueryOptions: <TData = Awaited<ReturnType<typeof getMyProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getMyProfile>>>;
export type GetMyProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get current user profile
 */
export declare function useGetMyProfile<TData = Awaited<ReturnType<typeof getMyProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update current user profile
 */
export declare const getUpdateMyProfileUrl: () => string;
export declare const updateMyProfile: (updateUserInput: UpdateUserInput, options?: RequestInit) => Promise<User>;
export declare const getUpdateMyProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
        data: BodyType<UpdateUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
    data: BodyType<UpdateUserInput>;
}, TContext>;
export type UpdateMyProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateMyProfile>>>;
export type UpdateMyProfileMutationBody = BodyType<UpdateUserInput>;
export type UpdateMyProfileMutationError = ErrorType<unknown>;
/**
 * @summary Update current user profile
 */
export declare const useUpdateMyProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
        data: BodyType<UpdateUserInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMyProfile>>, TError, {
    data: BodyType<UpdateUserInput>;
}, TContext>;
/**
 * @summary Get current user's listed pets
 */
export declare const getGetMyPetsUrl: () => string;
export declare const getMyPets: (options?: RequestInit) => Promise<Pet[]>;
export declare const getGetMyPetsQueryKey: () => readonly ["/api/users/me/pets"];
export declare const getGetMyPetsQueryOptions: <TData = Awaited<ReturnType<typeof getMyPets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyPets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyPetsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyPets>>>;
export type GetMyPetsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's listed pets
 */
export declare function useGetMyPets<TData = Awaited<ReturnType<typeof getMyPets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyPets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current user's adoption and foster applications
 */
export declare const getGetMyApplicationsUrl: () => string;
export declare const getMyApplications: (options?: RequestInit) => Promise<MyApplicationsResponse>;
export declare const getGetMyApplicationsQueryKey: () => readonly ["/api/users/me/applications"];
export declare const getGetMyApplicationsQueryOptions: <TData = Awaited<ReturnType<typeof getMyApplications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyApplications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyApplicationsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyApplications>>>;
export type GetMyApplicationsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's adoption and foster applications
 */
export declare function useGetMyApplications<TData = Awaited<ReturnType<typeof getMyApplications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyApplications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current user's favourited pets
 */
export declare const getGetMyFavouritesUrl: () => string;
export declare const getMyFavourites: (options?: RequestInit) => Promise<Pet[]>;
export declare const getGetMyFavouritesQueryKey: () => readonly ["/api/users/me/favourites"];
export declare const getGetMyFavouritesQueryOptions: <TData = Awaited<ReturnType<typeof getMyFavourites>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyFavourites>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyFavourites>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyFavouritesQueryResult = NonNullable<Awaited<ReturnType<typeof getMyFavourites>>>;
export type GetMyFavouritesQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's favourited pets
 */
export declare function useGetMyFavourites<TData = Awaited<ReturnType<typeof getMyFavourites>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyFavourites>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current user's donation history
 */
export declare const getGetMyDonationsUrl: () => string;
export declare const getMyDonations: (options?: RequestInit) => Promise<Donation[]>;
export declare const getGetMyDonationsQueryKey: () => readonly ["/api/users/me/donations"];
export declare const getGetMyDonationsQueryOptions: <TData = Awaited<ReturnType<typeof getMyDonations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyDonations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyDonations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyDonationsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyDonations>>>;
export type GetMyDonationsQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's donation history
 */
export declare function useGetMyDonations<TData = Awaited<ReturnType<typeof getMyDonations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyDonations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get admin KPI stats
 */
export declare const getGetAdminStatsUrl: () => string;
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin KPI stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all users (admin)
 */
export declare const getListAdminUsersUrl: (params?: ListAdminUsersParams) => string;
export declare const listAdminUsers: (params?: ListAdminUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getListAdminUsersQueryKey: (params?: ListAdminUsersParams) => readonly ["/api/admin/users", ...ListAdminUsersParams[]];
export declare const getListAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(params?: ListAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminUsers>>>;
export type ListAdminUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (admin)
 */
export declare function useListAdminUsers<TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(params?: ListAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Approve a pet listing
 */
export declare const getApprovePetUrl: (id: number) => string;
export declare const approvePet: (id: number, options?: RequestInit) => Promise<Pet>;
export declare const getApprovePetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approvePet>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approvePet>>, TError, {
    id: number;
}, TContext>;
export type ApprovePetMutationResult = NonNullable<Awaited<ReturnType<typeof approvePet>>>;
export type ApprovePetMutationError = ErrorType<unknown>;
/**
 * @summary Approve a pet listing
 */
export declare const useApprovePet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approvePet>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approvePet>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Toggle featured status for a pet
 */
export declare const getTogglePetFeaturedUrl: (id: number) => string;
export declare const togglePetFeatured: (id: number, options?: RequestInit) => Promise<Pet>;
export declare const getTogglePetFeaturedMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof togglePetFeatured>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof togglePetFeatured>>, TError, {
    id: number;
}, TContext>;
export type TogglePetFeaturedMutationResult = NonNullable<Awaited<ReturnType<typeof togglePetFeatured>>>;
export type TogglePetFeaturedMutationError = ErrorType<unknown>;
/**
 * @summary Toggle featured status for a pet
 */
export declare const useTogglePetFeatured: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof togglePetFeatured>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof togglePetFeatured>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Chat with the AI pet adoption assistant
 */
export declare const getAiChatUrl: () => string;
export declare const aiChat: (aiChatBody: AiChatBody, options?: RequestInit) => Promise<AiChat200>;
export declare const getAiChatMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
        data: BodyType<AiChatBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
    data: BodyType<AiChatBody>;
}, TContext>;
export type AiChatMutationResult = NonNullable<Awaited<ReturnType<typeof aiChat>>>;
export type AiChatMutationBody = BodyType<AiChatBody>;
export type AiChatMutationError = ErrorType<unknown>;
/**
 * @summary Chat with the AI pet adoption assistant
 */
export declare const useAiChat: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiChat>>, TError, {
        data: BodyType<AiChatBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof aiChat>>, TError, {
    data: BodyType<AiChatBody>;
}, TContext>;
/**
 * @summary Get AI-powered pet match recommendations
 */
export declare const getAiRecommendUrl: () => string;
export declare const aiRecommend: (aiRecommendBody: AiRecommendBody, options?: RequestInit) => Promise<AiRecommend200>;
export declare const getAiRecommendMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiRecommend>>, TError, {
        data: BodyType<AiRecommendBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof aiRecommend>>, TError, {
    data: BodyType<AiRecommendBody>;
}, TContext>;
export type AiRecommendMutationResult = NonNullable<Awaited<ReturnType<typeof aiRecommend>>>;
export type AiRecommendMutationBody = BodyType<AiRecommendBody>;
export type AiRecommendMutationError = ErrorType<unknown>;
/**
 * @summary Get AI-powered pet match recommendations
 */
export declare const useAiRecommend: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiRecommend>>, TError, {
        data: BodyType<AiRecommendBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof aiRecommend>>, TError, {
    data: BodyType<AiRecommendBody>;
}, TContext>;
/**
 * @summary Generate an AI adoption story for a pet
 */
export declare const getAiGenerateDescriptionUrl: () => string;
export declare const aiGenerateDescription: (aiGenerateDescriptionBody: AiGenerateDescriptionBody, options?: RequestInit) => Promise<AiGenerateDescription200>;
export declare const getAiGenerateDescriptionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiGenerateDescription>>, TError, {
        data: BodyType<AiGenerateDescriptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof aiGenerateDescription>>, TError, {
    data: BodyType<AiGenerateDescriptionBody>;
}, TContext>;
export type AiGenerateDescriptionMutationResult = NonNullable<Awaited<ReturnType<typeof aiGenerateDescription>>>;
export type AiGenerateDescriptionMutationBody = BodyType<AiGenerateDescriptionBody>;
export type AiGenerateDescriptionMutationError = ErrorType<unknown>;
/**
 * @summary Generate an AI adoption story for a pet
 */
export declare const useAiGenerateDescription: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof aiGenerateDescription>>, TError, {
        data: BodyType<AiGenerateDescriptionBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof aiGenerateDescription>>, TError, {
    data: BodyType<AiGenerateDescriptionBody>;
}, TContext>;
/**
 * @summary Get payment provider configuration (publishable keys)
 */
export declare const getGetPaymentConfigUrl: () => string;
export declare const getPaymentConfig: (options?: RequestInit) => Promise<GetPaymentConfig200>;
export declare const getGetPaymentConfigQueryKey: () => readonly ["/api/payments/config"];
export declare const getGetPaymentConfigQueryOptions: <TData = Awaited<ReturnType<typeof getPaymentConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPaymentConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPaymentConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getPaymentConfig>>>;
export type GetPaymentConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get payment provider configuration (publishable keys)
 */
export declare function useGetPaymentConfig<TData = Awaited<ReturnType<typeof getPaymentConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a Stripe PaymentIntent for a donation
 */
export declare const getCreateStripePaymentIntentUrl: () => string;
export declare const createStripePaymentIntent: (createStripePaymentIntentBody: CreateStripePaymentIntentBody, options?: RequestInit) => Promise<CreateStripePaymentIntent200>;
export declare const getCreateStripePaymentIntentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStripePaymentIntent>>, TError, {
        data: BodyType<CreateStripePaymentIntentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStripePaymentIntent>>, TError, {
    data: BodyType<CreateStripePaymentIntentBody>;
}, TContext>;
export type CreateStripePaymentIntentMutationResult = NonNullable<Awaited<ReturnType<typeof createStripePaymentIntent>>>;
export type CreateStripePaymentIntentMutationBody = BodyType<CreateStripePaymentIntentBody>;
export type CreateStripePaymentIntentMutationError = ErrorType<unknown>;
/**
 * @summary Create a Stripe PaymentIntent for a donation
 */
export declare const useCreateStripePaymentIntent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStripePaymentIntent>>, TError, {
        data: BodyType<CreateStripePaymentIntentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStripePaymentIntent>>, TError, {
    data: BodyType<CreateStripePaymentIntentBody>;
}, TContext>;
/**
 * @summary Confirm a Stripe payment by verifying server-side with Stripe
 */
export declare const getConfirmStripePaymentUrl: () => string;
export declare const confirmStripePayment: (confirmStripePaymentBody: ConfirmStripePaymentBody, options?: RequestInit) => Promise<ConfirmStripePayment200>;
export declare const getConfirmStripePaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmStripePayment>>, TError, {
        data: BodyType<ConfirmStripePaymentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof confirmStripePayment>>, TError, {
    data: BodyType<ConfirmStripePaymentBody>;
}, TContext>;
export type ConfirmStripePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof confirmStripePayment>>>;
export type ConfirmStripePaymentMutationBody = BodyType<ConfirmStripePaymentBody>;
export type ConfirmStripePaymentMutationError = ErrorType<unknown>;
/**
 * @summary Confirm a Stripe payment by verifying server-side with Stripe
 */
export declare const useConfirmStripePayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmStripePayment>>, TError, {
        data: BodyType<ConfirmStripePaymentBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof confirmStripePayment>>, TError, {
    data: BodyType<ConfirmStripePaymentBody>;
}, TContext>;
/**
 * @summary Stripe webhook endpoint
 */
export declare const getStripeWebhookUrl: () => string;
export declare const stripeWebhook: (options?: RequestInit) => Promise<void>;
export declare const getStripeWebhookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof stripeWebhook>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof stripeWebhook>>, TError, void, TContext>;
export type StripeWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof stripeWebhook>>>;
export type StripeWebhookMutationError = ErrorType<unknown>;
/**
 * @summary Stripe webhook endpoint
 */
export declare const useStripeWebhook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof stripeWebhook>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof stripeWebhook>>, TError, void, TContext>;
/**
 * @summary Create a PayPal order for a donation
 */
export declare const getCreatePaypalOrderUrl: () => string;
export declare const createPaypalOrder: (createPaypalOrderBody: CreatePaypalOrderBody, options?: RequestInit) => Promise<CreatePaypalOrder200>;
export declare const getCreatePaypalOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaypalOrder>>, TError, {
        data: BodyType<CreatePaypalOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPaypalOrder>>, TError, {
    data: BodyType<CreatePaypalOrderBody>;
}, TContext>;
export type CreatePaypalOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createPaypalOrder>>>;
export type CreatePaypalOrderMutationBody = BodyType<CreatePaypalOrderBody>;
export type CreatePaypalOrderMutationError = ErrorType<unknown>;
/**
 * @summary Create a PayPal order for a donation
 */
export declare const useCreatePaypalOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPaypalOrder>>, TError, {
        data: BodyType<CreatePaypalOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPaypalOrder>>, TError, {
    data: BodyType<CreatePaypalOrderBody>;
}, TContext>;
/**
 * @summary Capture a PayPal order after approval
 */
export declare const getCapturePaypalOrderUrl: () => string;
export declare const capturePaypalOrder: (capturePaypalOrderBody: CapturePaypalOrderBody, options?: RequestInit) => Promise<CapturePaypalOrder200>;
export declare const getCapturePaypalOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof capturePaypalOrder>>, TError, {
        data: BodyType<CapturePaypalOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof capturePaypalOrder>>, TError, {
    data: BodyType<CapturePaypalOrderBody>;
}, TContext>;
export type CapturePaypalOrderMutationResult = NonNullable<Awaited<ReturnType<typeof capturePaypalOrder>>>;
export type CapturePaypalOrderMutationBody = BodyType<CapturePaypalOrderBody>;
export type CapturePaypalOrderMutationError = ErrorType<unknown>;
/**
 * @summary Capture a PayPal order after approval
 */
export declare const useCapturePaypalOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof capturePaypalOrder>>, TError, {
        data: BodyType<CapturePaypalOrderBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof capturePaypalOrder>>, TError, {
    data: BodyType<CapturePaypalOrderBody>;
}, TContext>;
/**
 * @summary Record a CliQ bank transfer donation
 */
export declare const getConfirmCliqDonationUrl: () => string;
export declare const confirmCliqDonation: (confirmCliqDonationBody: ConfirmCliqDonationBody, options?: RequestInit) => Promise<Donation>;
export declare const getConfirmCliqDonationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmCliqDonation>>, TError, {
        data: BodyType<ConfirmCliqDonationBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof confirmCliqDonation>>, TError, {
    data: BodyType<ConfirmCliqDonationBody>;
}, TContext>;
export type ConfirmCliqDonationMutationResult = NonNullable<Awaited<ReturnType<typeof confirmCliqDonation>>>;
export type ConfirmCliqDonationMutationBody = BodyType<ConfirmCliqDonationBody>;
export type ConfirmCliqDonationMutationError = ErrorType<unknown>;
/**
 * @summary Record a CliQ bank transfer donation
 */
export declare const useConfirmCliqDonation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmCliqDonation>>, TError, {
        data: BodyType<ConfirmCliqDonationBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof confirmCliqDonation>>, TError, {
    data: BodyType<ConfirmCliqDonationBody>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map