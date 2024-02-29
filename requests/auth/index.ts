import api from "@/connection";

interface IAuth {
  username: string;
  password: string;
}

export async function fetchRegister({ username, password }: IAuth) {
  const { data } = await api.post("/auth/register", {
    username,
    password,
  });

  return data;
}

export async function fetchLogin({ username, password }: IAuth) {
  const { data } = await api.post("/auth/login", {
    username,
    password,
  });

  return data;
}

export async function getCurrentUser(token?: string) {
  const { data } = await api.get(
    "/auth/get_current_user",
    token ? { headers: { Authorization: token } } : {},
  );
  return data.user;
}
