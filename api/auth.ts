// API integration for authentication


export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  // Mocked login: always returns a fake user and token
  return {
    user: {
      email: payload.email,
      name: "Mock User"
    },
    token: "mock-token"
  };
}

export async function signup(payload: SignupPayload) {
  // Mocked signup: always returns a fake user and token
  return {
    user: {
      email: payload.email,
      name: payload.name
    },
    token: "mock-token"
  };
}
