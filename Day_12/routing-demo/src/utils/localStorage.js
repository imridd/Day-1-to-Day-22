const STORAGE_KEY = "authUser";
export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEY,JSON.stringify(user));
};
export const getUser = () => {
  const user =localStorage.getItem(STORAGE_KEY);
  return user ? JSON.parse(user): null;
};
export const removeUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};