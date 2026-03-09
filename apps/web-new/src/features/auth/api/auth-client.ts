import type {
  AuthMessageResponse,
  ForgotPasswordBody,
  RegisterResponse,
  ResetPasswordBody,
  SessionUser,
  SignInBody,
  SignInResponse,
  SignUpBody,
  VerifyEmailBody,
} from "@advanced-quiz/contracts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type MutationError = {
  message: string;
  statusCode?: number;
  code?: string;
  requiresEmailVerification?: boolean;
  email?: string;
};

type MutationResult<T> = {
  data: T | null;
  error: MutationError | null;
};

type SessionResponse = {
  user: SessionUser;
};
type ResendVerificationBody = {
  email: string;
};

function getErrorMessage(error: unknown, fallback: string): MutationError {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null
  ) {
    const data = error.response.data as {
      message?: string;
      statusCode?: number;
      code?: string;
      requiresEmailVerification?: boolean;
      email?: string;
    };

    return {
      message: data.message ?? fallback,
      statusCode: data.statusCode,
      code: data.code,
      requiresEmailVerification: data.requiresEmailVerification,
      email: data.email,
    };
  }

  return { message: fallback };
}

export const signIn = {
  email: async (data: SignInBody): Promise<MutationResult<SignInResponse>> => {
    try {
      const response = await api.post<SignInResponse>("/api/auth/login", data);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error, "Authentication failed"),
      };
    }
  },
};

export const signUp = {
  email: async (
    data: SignUpBody,
  ): Promise<MutationResult<RegisterResponse>> => {
    try {
      const response = await api.post<RegisterResponse>(
        "/api/auth/register",
        data,
      );
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error, "Registration failed"),
      };
    }
  },
};

export async function verifyEmail(
  data: VerifyEmailBody,
): Promise<MutationResult<SignInResponse>> {
  try {
    const response = await api.post<SignInResponse>(
      "/api/auth/verify-email",
      data,
    );
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error, "Verification failed"),
    };
  }
}

export async function resendVerification(
  data: ResendVerificationBody,
): Promise<MutationResult<AuthMessageResponse>> {
  try {
    const response = await api.post<AuthMessageResponse>(
      "/api/auth/resend-verification",
      data,
    );
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error, "Unable to resend verification code"),
    };
  }
}

export async function forgotPassword(
  data: ForgotPasswordBody,
): Promise<MutationResult<AuthMessageResponse>> {
  try {
    const response = await api.post<AuthMessageResponse>(
      "/api/auth/forgot-password",
      data,
    );
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(
        error,
        "We couldn't start password recovery. Please try again.",
      ),
    };
  }
}

export async function resetPassword(
  data: ResetPasswordBody,
): Promise<MutationResult<AuthMessageResponse>> {
  try {
    const response = await api.post<AuthMessageResponse>(
      "/api/auth/reset-password",
      data,
    );
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error, "Password reset failed"),
    };
  }
}

export async function signOut() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    window.location.href = "/sign-in";
  }
}

export function useSession() {
  const { data, isPending, error } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const response = await api.get<SessionResponse>("/api/v1/users/me");
        return response.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data,
    isPending,
    error,
  };
}
