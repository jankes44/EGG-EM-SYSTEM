import axios from "axios";

export const register = (newUser) => {
  return axios
    .post(global.BASE_URL + "/users/register", {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      sites: newUser.sites,
    })
    .then((res) => {
      console.log(res);
    });
};
export let loginVar = "";
export const login = (user) => {
  return axios
    .post(global.BASE_URL + "/users/login", {
      email: user.email,
      password: user.password,
    })
    .then((res) => {
      localStorage.setItem("usertoken", res.data);
      return res.data;
    })
    .catch((err) => {
      if (err.response) {
        loginVar = err.response.data.error.name;
        console.log(err.response);
      } else loginVar = "Server not responding, check your connection";
    });
};
